import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import multer from 'multer';
import fs from "fs";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import grade from "./grader.js";

// Configure __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const upload = multer({ dest: 'audioUploads/' });
const port = process.env.PORT || 3000;

// Gemini configuration
const apiKey = "AIzaSyBSmCA-Vpx4hQgefEcFFlsDxuzRq6zVbDk";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline';");
  next();
});

// View engine setup
app.set("views", path.join(__dirname, "../public/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.get("/", (req, res) => res.render("index"));
app.get("/page2", (req, res) => res.render("page2"));
app.get("/page3", (req, res) => res.render("page3"));
app.get("/page4", (req, res) => res.render("page4"));

// API Routes
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "you are given an audio file you will have to transcribe it completely included all the disfluencies...",
});

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  return uploadResult.file;
}

async function run(filePath, mimeType) {
  const uploadedFile = await uploadToGemini(filePath, mimeType);
  const chatSession = model.startChat({
    generationConfig,
    history: [{
      role: "user",
      parts: [{
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      }],
    }],
  });
  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  return result.response.text();
}

app.post('/upload', upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    const transcription = await run(req.file.path, req.file.mimetype || 'audio/mpeg');
    fs.unlinkSync(req.file.path);
    res.send(transcription);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send('Error processing audio.');
  }
});

app.post('/grade', async (req, res) => {
  try {
    const gradeResult = await grade(req.body.transcript);
    res.json({ gradeResult });
  } catch (error) {
    console.error("Grading error:", error);
    res.status(500).send("Error grading transcript");
  }
});

// Vercel deployment
export default (req, res) => {
  // Add the app's request handler logic here
  app(req, res);
};

// Local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server started on port ${port}`));
}