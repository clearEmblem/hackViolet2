const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const apiKey = "AIzaSyDlLuwyPCwQj4-IJ1iTcSejZsNehsEbPbw";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "you are given an audio file you will have to transcribe it completely included all the disfluencies like \"ums\" and \"aah\" and try not to missout on any disfluencies, secondly transcribe all the pauses taken while talking in this format [duration of pause], do not count small pauses like under 1 second count longer ones,\n and then also transcribe bodily sounds such as coughs by [bodily sound]",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run() {
    // TODO Make these files available on the local file system
    // You may need to update the file paths
    const files = [
        await uploadToGemini("test.mp3", "audio/mpeg"),
    ];

    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(["trancribe this file", {
        fileData: {
            fileUri: files[0].uri,
            mimeType: files[0].mimeType,
        },
    },
    ]);
    console.log(result.response.text());
}

run();

export default { uploadToGemini };