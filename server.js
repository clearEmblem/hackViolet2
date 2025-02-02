import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import multer from 'multer';
import fs from "fs";
import path from "path";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import grade from "./grader.js";

const apiKey = "AIzaSyBSmCA-Vpx4hQgefEcFFlsDxuzRq6zVbDk";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const app = express();

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Multer: Store files in memory (avoid read-only errors)
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
    res.send('Hello, ready to process audio files!');
});

async function uploadToGemini(filePath, mimeType) {
    try {
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: path.basename(filePath),
        });
        return uploadResult.file;
    } catch (error) {
        console.error("Error uploading to Gemini:", error);
        throw error;
    }
}

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "you are given an audio file you will have to transcribe it completely included all the disfluencies like \"ums\" and \"aah\" and try not to miss out on any disfluencies, secondly transcribe all the pauses taken while talking in this format [duration of pause], do not count small pauses like under 1 second count longer ones, and then also transcribe bodily sounds such as coughs by [bodily sound]",
});

const generationConfig = {
    temperature: 0.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(filePath, mimeType) {
    try {
        const uploadedFile = await uploadToGemini(filePath, mimeType);

        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            fileData: {
                                mimeType: uploadedFile.mimeType,
                                fileUri: uploadedFile.uri,
                            },
                        },
                    ],
                },
            ],
        });

        const result = await chatSession.sendMessage("");
        return result.response.text();
    } catch (error) {
        console.error("Error in run:", error);
        throw error;
    }
}

app.post('/upload', upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Save file to /tmp since it's writable on Vercel
        const filePath = `/tmp/${req.file.originalname}`;
        fs.writeFileSync(filePath, req.file.buffer);

        const mimeType = req.file.mimetype || 'audio/mpeg';
        const transcription = await run(filePath, mimeType);

        fs.unlinkSync(filePath); // Clean up

        res.send(transcription);
    } catch (error) {
        console.error("Error processing audio:", error);
        res.status(500).send('Error processing audio.');
    }
});

app.post('/grade', async (req, res) => {
    const transcript = req.body.transcript;

    try {
        const gradeResult = await grade(transcript);
        res.json({ gradeResult });
    } catch (error) {
        console.error("Error grading the transcript:", error);
        res.status(500).send("Error grading the transcript");
    }
});

// Export for Vercel
export default app;