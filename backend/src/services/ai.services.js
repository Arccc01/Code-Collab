require('dotenv').config()
const {GoogleGenAI} = require('@google/genai')

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

async function generateReview(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}

module.exports = generateReview