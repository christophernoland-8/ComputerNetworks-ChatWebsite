window.onload = () => {
    const websocket = new WebSocket("ws://localhost:8000/");

const username = prompt("Enter your username:");
const messages = [];

const messageBox = document.getElementById('message-box');
const inputBox = document.getElementById("input-box");

function sendMessage(text) {
    const message = {
        from: username,
        text: text
    };

    messages.push({
        from: username,
        text: text,
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

// ---------------- Autocorrect -----------------------//

 function autoCorrect(){
    
 }

inputBox.addEventListener('keydown', typeText);

updateMessageBox();
}
