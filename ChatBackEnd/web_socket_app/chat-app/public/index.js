const websocket = new WebSocket("ws://localhost:8000/");

const username = location.port;

let displayName = prompt("Enter your username:");

/*function sendMessage() {
    const input = document.getElementById("message");
    const message = `${username}: ${input.value}`;
    ws.send(message);
    input.value = "";
}

async function sendMessage(text) {
  const recipient = username === '3000' ? '3001' : '3000';
  messages.push({
    'from': username, 'to': recipient,
    'text': text,
    'verified': true
  });
  updateMessageBox();
}*/

async function sendMessage(text) {
    const recipient = currentConvo;

    const message = {
        'from': username, 'to': recipient,
        'text': text
    };
    messages.push({
        'from': username, 'to': recipient,
        'text': text,
        'verified': true
    });
    websocket.send(JSON.stringify({
        'type': 'msg', ...message
    }));
    updateMessageBox();
}

async function receiveData({data}) {
    const event = JSON.parse(data);
    switch (event.type) {
        case 'msg':
            if (event.to === username) {
              messages.push({
                  'from': event.from, 'to': event.to,
                  'text': event.text
              });
              updateMessageBox();
            }
            break;
        default:
            break;
    }
}
websocket.addEventListener("message", receiveData);

const messageBox = document.getElementById('message-box');
const inputBox = document.getElementById("input-box");
const contactsBox = document.getElementById('contacts-box');
const messages = [];
const users = {};
let currentConvo = '';

function updateMessageBox(user=null) {
    // update the message box to show all messages that have been sent and received between us and user
    const fmessages = messages.filter((message) => (user === null
        || (message.from === username && message.to === user)
        || (message.from === user && message.to === username)));
    if (fmessages.length === 0) {
        inputBox.placeholder = "Enter a message here...";
        messageBox.innerHTML = '';
        return;
    }
    let prev = null;
    let newHTML = '';
    fmessages.forEach((message) => {
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






/*const setConvo = (user) => {
    currentConvo = user;
    updateMessageBox(user);
    updateContactsBox();
}
function displayUsername() {
    document.getElementById("username").innerText = username;
}*/

function updateContactsBox() {
    if (contactsBox === null)
        return;
    let newHTML = '';
    for (const [key, val] of Object.entries(users)) {
        if (key !== username)
            newHTML +=
                `<span class="contact ${key === currentConvo ? 'active':''}" onClick="setConvo('${key}')">`
                + key
                + '</span>';
    }
    newHTML += '<span class="contact" onclick="addContact()">+</span>';
    contactsBox.innerHTML = newHTML;
}
/*
function addContact() {
    const user = prompt("Enter username of new contact:", "");
    if (user === "") return;
    connectUser(user);
}*/

function typeText(event) {
    let key = event.keyCode || event.which;
    if (key === 13 && inputBox.value !== '') {
        event.preventDefault();
        inputBox.placeholder = '';
        sendMessage(inputBox.value);
        inputBox.value = '';
    }
}
inputBox.addEventListener('keydown', typeText);


updateMessageBox();
updateContactsBox();