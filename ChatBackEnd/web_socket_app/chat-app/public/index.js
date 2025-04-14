window.onload = () => {
    let username = null;

    while (!username || username.trim() === '') {
        username = prompt("Enter your username:");
    }

    initChat(username);
};

function initChat(username) {
    const websocket = new WebSocket("ws://localhost:8000/");
    const messages = [];

    const messageBox = document.getElementById('message-box');
    const inputBox = document.getElementById("input-box");

    function sendMessage(text) {
        const correctedText = autoCorrect(text);

        const message = {
            from: username,
            text: correctedText
        };

        messages.push({
            from: username,
            text: correctedText,
            verified: true
        });

        websocket.send(JSON.stringify({
            type: 'msg',
            ...message
        }));

        updateMessageBox();
    }

    function receiveData({ data }) {
        const event = JSON.parse(data);

        switch (event.type) {
            case 'msg':
                if (event.from === username) return;

                messages.push({
                    from: event.from,
                    text: event.text
                });
                updateMessageBox();
                break;
            default:
                break;
        }
    }

    websocket.addEventListener("message", receiveData);

    function updateMessageBox() {
        let prev = null;
        let newHTML = '';

        messages.forEach((message) => {
            const newBlock = prev !== message.from;

            if (newBlock) {
                if (prev !== null)
                    newHTML += '</div>';

                newHTML += `<div class="message-group ${message.from === username ? 'me' : 'them'}">`;
            }

            const showSender = message.from !== username;
            const messageHTML = `<div class="message">`
                + (showSender ? `<strong>${message.from}:</strong> ` : '')
                + message.text
                + '</div>';

            newHTML += messageHTML;
            prev = message.from;
        });

        newHTML += '</div>';
        messageBox.innerHTML = newHTML;
        messageBox.scrollTop = messageBox.scrollHeight;
    }

    function typeText(event) {
        let key = event.keyCode || event.which;
        if (key === 13 && inputBox.value !== '') {
            event.preventDefault();
            inputBox.placeholder = '';
            sendMessage(inputBox.value);
            inputBox.value = '';
        }
    }

    // -------------- Autocorrect ---------------------//

    function realTimeAutoCorrect(e) {
        const cursorPos = inputBox.selectionStart;
        const text = inputBox.value;

        const beforeCursor = text.slice(0, cursorPos);
        const match = beforeCursor.match(/(\b\w+)$/);
        if (!match) return;

        const lastWord = match[1];
        const correctedWord = getCorrection(lastWord);

        if (correctedWord && correctedWord !== lastWord) {
            const start = cursorPos - lastWord.length;
            const newText =
                text.slice(0, start) +
                correctedWord +
                text.slice(cursorPos);

            inputBox.value = newText;

            const newCursorPos = start + correctedWord.length;
            inputBox.setSelectionRange(newCursorPos, newCursorPos);
        }
    }

    function getCorrection(word) {
        const corrections = {
            // Typos / Misspellings
            'teh': 'the',
            'recieve': 'receive',
            'definately': 'definitely',
            'occured': 'occurred',
            'adress': 'address',
            'seperate': 'separate',
            'tommorow': 'tomorrow',
            'goverment': 'government',
            'embarass': 'embarrass',
            'arguement': 'argument',
            'becuase': 'because',
            'wierd': 'weird',
            'calender': 'calendar',
            'remeber': 'remember',
            'accomodate': 'accommodate',
            'beleive': 'believe',
            'responsiblity': 'responsibility',
            'enviroment': 'environment',
            'occurence': 'occurrence',
            'untill': 'until',
        
            // Abbreviations / Text Slang
            'u': 'you',
            'ur': 'your',
            'r': 'are',
            'b4': 'before',
            'idk': "I don't know",
            'lol': 'laugh out loud',
            'lmao': 'laughing my ass off',
            'brb': 'be right back',
            'omg': 'oh my god',
            'omw': 'on my way',
        
            // Grammar Confusions
            'your': "you're",
            'youre': "you're",
            'youre': 'you\'re',
            'its': "it's",
            'it\'s': 'its',
            'than': 'then',
            'then': 'than',
            'affect': 'effect',
            'lose': 'loose',
            'loose': 'lose',
            'were': "we're",
            'we\'re': 'were',
            'to': 'too',
            'too': 'to',
            'there': 'their',
            'their': 'there',
            'theyre': "they're",
            'they\'re': 'their',
        
            // Phonetic / Casual
            'ya': 'yeah',
            'nah': 'no',
            'gonna': 'going to',
            'wanna': 'want to',
            'gotta': 'got to',
            'wassup': "what's up",
            'ima': "I'm going to",
            'prolly': 'probably',
            'cuz': 'because',
            'dunno': "don't know",
        
            // Keyboard Slip-Ups
            'jsut': 'just',
            'taht': 'that',
            'hte': 'the',
            'thsi': 'this',
            'abotu': 'about',
            'knwo': 'know',
            'yuo': 'you',
            'adn': 'and',
            'coudl': 'could',
            'shoudl': 'should',
            'woudl': 'would',
            'woh': 'who',
            'whcih': 'which',
            'tehre': 'there',
        
            // Missing Apostrophes
            'dont': "don't",
            'cant': "can't",
            'wont': "won't",
            'didnt': "didn't",
            'isnt': "isn't",
            'wasnt': "wasn't",
            'wouldnt': "wouldn't",
            'couldnt': "couldn't",
            'im': "I'm",
            'ive': "I've",
        
            // Internet / Pop Culture Misspellings
            'noob': 'newbie',
            'smol': 'small',
            'heckin': 'freaking',
            'pupper': 'puppy',
            'doggo': 'dog',
            'henlo': 'hello',
            'fren': 'friend',
            'yeet': '',
            'sus': 'suspicious',
            'thicc': 'thick',
            'lit': 'cool',
            'ye': 'yeah',
            'gud': 'good',
            'bae': 'babe',
            'fam': 'family',
            'bro': 'brother',
            'boi': 'boy',
            'werk': 'work',
            'tru': 'true',
            'gnite': 'goodnight'
        };
        

        const lower = word.toLowerCase();
        const corrected = corrections[lower];

        if (!corrected) return null;

        return word[0] === word[0].toUpperCase()
            ? corrected.charAt(0).toUpperCase() + corrected.slice(1)
            : corrected;
    }

    function autoCorrect(text) {
        function escapeHTML(str) {
            return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        return text.split(/\b/).map(part => {
            const correction = getCorrection(part);
            return correction || escapeHTML(part);
        }).join('');
    }

    // ---------- Color Picker Logic ---------- //
    const bgPicker = document.getElementById("bg-color-picker");
    const sentPicker = document.getElementById("sent-color-picker");
    const recvPicker = document.getElementById("recv-color-picker");

    bgPicker.addEventListener("input", () => {
        document.documentElement.style.setProperty('--bg-color', bgPicker.value);
    });

    sentPicker.addEventListener("input", () => {
        document.documentElement.style.setProperty('--sent-color', sentPicker.value);
        document.documentElement.style.setProperty('--sent-tail-color', sentPicker.value);
    });

    recvPicker.addEventListener("input", () => {
        document.documentElement.style.setProperty('--recv-color', recvPicker.value);
        document.documentElement.style.setProperty('--recv-tail-color', recvPicker.value);
    });

    inputBox.addEventListener('keydown', typeText);
    inputBox.addEventListener('input', realTimeAutoCorrect);

    updateMessageBox();
}
