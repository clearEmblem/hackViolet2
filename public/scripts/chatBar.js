const sendButton = document.getElementById('send-button');
const chatInput = document.getElementById('chat-input');
const chatContent = document.getElementById('chat-content');

async function sendMessage() {
    const userMessage = chatInput.value;

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
        chatContent.innerHTML += `<div class="bot-message">${botMessage}</div>`;

        // Scroll to the bottom of the chat content
        chatContent.scrollTop = chatContent.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display an error message in the chat
    }
}

sendButton.addEventListener('click', () => {
    if (chatInput.value.trim()) {
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
