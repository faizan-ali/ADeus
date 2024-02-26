import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Assuming the body is a Blob of audio data
    const audioBlob = await req.blob();
    const buffer = await blobToBuffer(audioBlob);
    const file = await toFile(buffer, "tmp.mp3", { type: "mp3" });
    const data = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.error();
  }
}

// Helper function to convert a Blob to a Buffer
async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
