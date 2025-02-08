import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const doubt = formData.get('doubt');

    const prompt = `Answer the following question:\n\nQuestion: Please explain in detail ${doubt}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: "You are StudyBuddy, a helpful AI assistant. You are helping a student understand a concept. Answer the student's question in a clear and concise manner.",
    });
    const response = await model.generateContent(prompt);
    const textResponse = response.response.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

    return NextResponse.json({ response: textResponse });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}