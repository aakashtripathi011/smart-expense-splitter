require("dotenv").config();

const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function scanReceipt(imagePath) {
    const imageData = fs.readFileSync(imagePath);

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
            {
                inlineData: {
                    mimeType: "image/png",
                    data: imageData.toString("base64"),
                },
            },
            {
                text: `
Read this receipt carefully.

Extract:
- Every item name
- Price of every item
- Total amount

Return ONLY valid JSON in this exact format:

{
    "items": [
        {
            "name": "item name",
            "price": 0
        }
    ],
    "total": 0
}
                `,
            },
        ],
    });

    return response.text;
}

module.exports = {
    scanReceipt,
};