const express = require("express");
const path = require("path");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src'self' 'unsafe-inline';");
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Added to parse JSON bodies

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/page2", (req, res) => {
  res.render("page2");
});

app.get("/page3", (req, res) => {
  res.render("page3");
});

app.get("/page4", (req, res) => {
  res.render("page4");
});

app.get("/results", (req, res) => {
  res.render("results");
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

// New route for loader asset
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

// New runChat function and POST /chat endpoint
const MODEL_NAME = "gemini-2.0-flash-exp";
const API_KEY = "AIzaSyBSmCA-Vpx4hQgefEcFFlsDxuzRq6zVbDk";

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings ...
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "You have received a summary of a topic, a transcription of a presenter presenting about the topic, and some feedback which was given to the presenter. You are now talking to the presenter. They will likely ask some questions about why certain feedback was given too them. You need to examine their transcript and feedback given to help them understand. You are also responsible for providing presenting suggestions to the presenter if they ask for it" }],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput);
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint for chat requests (POST request)
app.post('/api/chat', async (req, res) => { // <--- New route: /api/chat
  try {
    const userInput = req.body?.userInput;
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    const response = await runChat(userInput);
    res.json({ response }); // This sends a JSON response
  } catch (error) {
    console.error('Error in /api/chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
