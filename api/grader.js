import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBSmCA-Vpx4hQgefEcFFlsDxuzRq6zVbDk";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function grade(text) {
    const parts = [
        {
            text: `The input is provided in JSON schema, the input is formatted in such a format ={"type": "", "prompt": "", "transcript": ""}

type : represents values "EMOJI" or "TEXT"
prompt: represents the topic of the speech whos transcript you will be given in the json object
transcript: the transcript you have to grade, the transcript represents [bodily sounds] like coughs like this [cough] or time taken to pause and think by the speaker [time in seconds]

Write everything as if you were speaking to the presenter naturally and humbly.

For each of the following categories provide a rating out of 100 and a small summary of why you gave the rating.
Professional language
Speaking Skills
Information Contained
Time Management
Grammar
Relevance

Provide an overall score and short justification.

Provide an example of a strong sentence which the presenter used, and explain why the sentence was strong.
Provide an example of a weak sentence which the presenter used, and explain why the sentence was weak.

Provide an example of topics contained in the paragraphs which were not covered by the presenter.

At the end provide a short summary of what the person could have done to improve their presentation.
Do not mention visual aids.
respond in following format of json

output format = {  "type": "",  "ratings": {    "professional_language": {      "score": 0,      "summary": ""    },    "speaking_skills": {      "score": 0,      "summary": ""    },    "information_contained": {      "score": 0,      "summary": ""    },    "time_management": {      "score": 0,      "summary": ""    },    "grammar": {      "score": 0,      "summary": ""    },    "relevance": {      "score": 0,      "summary": ""    }  },  "overall_score": {    "score": 0,    "justification": ""  },  "examples": {    "strong_sentence": {      "sentence": "",      "explanation": ""    },    "weak_sentence": {      "sentence": "",      "explanation": ""    }  },  "missing_topics": [""]}`
        },
        { text: `input: ${text}` },
        { text: "output: " },
    ];

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
        });

        const responseText = result.response.text();

        // Extract JSON (handling potential text before/after):
        const jsonStartIndex = responseText.indexOf('{');
        const jsonEndIndex = responseText.lastIndexOf('}');

        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
            console.error("Gemini Response Text:", responseText); // Log the full response for debugging
            throw new Error("Invalid JSON received from Gemini: Could not find JSON object markers.");
        }

        const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
        const parsedResponse = JSON.parse(jsonString);

        return parsedResponse; // Return the parsed JSON object

    } catch (error) {
        console.error("Error processing Gemini response:", error);
        // Important: Log the full Gemini response for debugging
        if (result && result.response && result.response.text) {
            console.error("Gemini Response Text:", result.response.text());
        }
        throw error; // Re-throw the error
    }
}

export default grade;