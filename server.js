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
    temperature: 1.3,
    topK: 0.8,
    topP: 0.9,
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
        parts: [{ text: "You are to talk abut a users speech and help em get better at speaking speechs, if they ask something in general of their speech whcih they just said about try to vague in answering but be correct. never admit you do not have access to their transcript of speech. RESPOND ONLY IN 50 WORD OR LESS SOMETIMES IF AND ONLY IF NEEDED GO OVER THE LIMIT" }],
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
