
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const data = await req.json();
    const thread: string = data.thread;
    const language: string = data.language;
    console.log(thread, language);

    if (!thread || !language) {
      return NextResponse.json({
        error: "Thread and language must be provided.",
      });
    }

    const prompt = `Generate a instagram post from the following prompt in ${language} language and only return the post without any other text or code blocks:
    "${thread}"`;

    const result = await model.generateContent(prompt);

    const response = result.response;
    let output = response.text();
    console.log(output);

    let correctedText = output.replace(/```/g, ""); 

    if (!correctedText) {
      return NextResponse.json({
        error: "Failed to generate the corrected text.",
      });
    }
    return NextResponse.json({
      correctedText,
    });
  } catch (error) {
    console.error("Error correcting grammar and spelling:", error);
    return NextResponse.json({
      error: "An error occurred while processing the text.",
    });
  }
}
