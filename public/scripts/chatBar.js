const sendButton = document.getElementById('send-button');
const chatInput = document.getElementById('chat-input');
const chatContent = document.getElementById('chat-content');

async function waitForChatData() {
    // Wait until both "transcript" and "feedback" exist in local storage
    while (!localStorage.getItem("transcript") || !localStorage.getItem("feedback")) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return `this is my data which i am providing you advise me on this ${localStorage.getItem("transcript")} and now the feedback ${localStorage.getItem("feedback")}`;
}

async function sendMessage() {
    // If chatInput is empty, wait for the necessary chat data and use it as the message.
    let userMessage = chatInput.value.trim();
    if (!userMessage) {
        userMessage = await waitForChatData();
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput: userMessage }),
        });

        const data = await response.json();
        console.log(data);
        const botMessage = data.response;

        // Append user and bot messages to the chat content
        chatContent.innerHTML += `<div class="user-message">${userMessage}</div>`;
        chatContent.innerHTML += `<br>`;
        chatContent.innerHTML += `<div class="bot-message">${botMessage}</div>`;

        // Scroll to the bottom of the chat content
        chatContent.scrollTop = chatContent.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display an error message in the chat
    }
}

sendButton.addEventListener('click', () => {
    if (chatInput.value.trim() || localStorage.getItem("transcript") && localStorage.getItem("feedback")) {
        sendMessage();
        chatInput.value = '';
    }
});

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendButton.click();
    }
});
