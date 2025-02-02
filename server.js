import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import multer from 'multer';
import fs from "fs";
import path from "path";
import cors from "cors";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import grade from "./grader.js";

// Create a writable directory within /tmp
const uploadDir = '/tmp/audioUploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

const apiKey = "AIzaSyBSmCA-Vpx4hQgefEcFFlsDxuzRq6zVbDk";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const app = express();

// Enable CORS
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
    res.send('Hello lets send the file!');
});

async function uploadToGemini(filePath, mimeType) {
    try {
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: path.basename(filePath), // Or a more descriptive name
        });
        const file = uploadResult.file;
        console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
        return file;
    } catch (uploadError) {
        console.error("Error uploading to Gemini:", uploadError);
        throw uploadError; // Re-throw to be caught by the caller
    }
}

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "you are given an audio file you will have to transcribe it completely included all the disfluencies like \"ums\" and \"aah\" and try not to missout on any disfluencies, secondly transcribe all the pauses taken while talking in this format [duration of pause], do not count small pauses like under 1 second count longer ones,\n and then also transcribe bodily sounds such as coughs by [bodily sound]",
});

const generationConfig = {
    temperature: 0.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(filePath, mimeType) { // Accept file path and MIME type
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

        const result = await chatSession.sendMessage("INSERT_INPUT_HERE"); // Or leave empty
        console.log(result.response.text());
        return result.response.text(); // Return the transcription

    } catch (error) {
        console.error("Error in run:", error);
        throw error; // Important: Re-throw the error
    }
}

app.post('/upload', upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype || 'audio/mpeg';

        const transcription = await run(filePath, mimeType);  // Call run with the file info

        fs.unlinkSync(filePath); // Clean up the file

        res.send(transcription);
        console.log(transcription);// Send the transcription back to the client

    } catch (error) {
        console.error("Error in /upload route:", error);
        res.status(500).send('Error processing audio.');
    }
});

app.post('/grade', async (req, res) => {
    const transcript = req.body.transcript;
    console.log("Transcript to grade:", transcript);

    try {
        const gradeResult = await grade(transcript);
        console.log("Grade result:", gradeResult);
        res.json({ gradeResult });
    } catch (error) {
        console.error("Error grading the transcript:", error);
        res.status(500).send("Error grading the transcript");
    }
});

// Export the app as a serverless function for Vercel
module.exports = (req, res) => {
    app(req, res);
};