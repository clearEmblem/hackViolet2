// chat.js (Client-side JavaScript)

const chatContent = document.getElementById('chat-content');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
let conversationHistory = [];

// Load initial history (if needed - adapt to your storage)
function loadInitialHistory() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        try {
            conversationHistory = JSON.parse(storedHistory);
            // Update the structure of the loaded history
            conversationHistory = conversationHistory.map(message => {
                if (message.parts) {
                    return message; // Message already has parts (from previous correct runs)
                } else if (message.content) {
                    return {
                        role: message.role,
                        parts: [{ text: message.content }] // Add parts property
                    };
                } else {
                    return message; // Leave other messages unchanged
                }
            });
            conversationHistory.forEach(msg => displayMessage(msg.parts[0].text, msg.role)); // Access text from parts
        } catch (error) {
            console.error("Error parsing chat history:", error);
            localStorage.removeItem('chatHistory'); // Clear invalid data
        }
    }
}

loadInitialHistory();

sendButton.addEventListener('click', () => {
    sendMessage();
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage === "") return;

    displayMessage(userMessage, 'user');
    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] }); // Corrected
    chatInput.value = '';

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ msg: userMessage, history: conversationHistory })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Server response:", data); // Log the server response
            const aiResponse = data.response;
            displayMessage(aiResponse, 'ai');
            conversationHistory.push({ role: 'assistant', parts: [{ text: aiResponse }] });
            saveHistory();
        })
        .catch(error => {
            console.error("Error:", error);
            displayMessage("Error communicating with the server.", 'ai');
        });
}

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);
    messageDiv.textContent = message;
    chatContent.appendChild(messageDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function saveHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
}

console.log('chat.js loaded successfully');