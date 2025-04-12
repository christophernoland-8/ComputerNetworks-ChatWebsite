window.onload = () => {
    const websocket = new WebSocket("ws://localhost:8000/");

const username = prompt("Enter your username:");
const messages = [];

const messageBox = document.getElementById('message-box');
const inputBox = document.getElementById("input-box");

function sendMessage(text) {

    const correctedText = autoCorrect(text); // <--- Apply autocorrection

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

function autoCorrect(text) {
    const corrections = {
        'teh': 'the',
        'recieve': 'receive',
        'definately': 'definitely',
        'occured': 'occurred',
        'adress': 'address',
        'wich': 'which',
        'dont': "don't",
        'im': "I'm",
        'idk': "I don't know",
        'u': 'you',
        'henlo': 'hello',
        'jeneral': 'general',
        'kenoshi': 'kenobi'
    };

    // Escape HTML special characters
    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");
    }

    return text.split(/\b/).map(part => {
        const lower = part.toLowerCase();
        const corrected = corrections[lower];

        if (corrected) {
            // Capitalize if the original word was capitalized
            return part[0] === part[0].toUpperCase()
                ? corrected.charAt(0).toUpperCase() + corrected.slice(1)
                : corrected;
        }

        return escapeHTML(part);
    }).join('');
}

inputBox.addEventListener('keydown', typeText);

updateMessageBox();
}
