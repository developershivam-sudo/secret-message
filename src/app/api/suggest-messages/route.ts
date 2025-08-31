import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.BASE_URL,
});

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal and sensitive topics, focusing instead on universal themes that encourage friendly interaction. For exapmle, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who could it be?||What's a simple thing that makes happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."

    const stream = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      max_completion_tokens: 400,
      messages: [{ role: "user", content: prompt }],
      stream: true
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";

          if (content) {
            controller.enqueue(encoder.encode(`${JSON.stringify({ content })}\n\n`));
          }
        }
        controller.close();
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': "text/event-stream",
        'Cache-Control': "no-cache",
        'Connection': "keep-alive"
      }
    })

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({
        name, status, headers, message
      }, { status });
    } else {
      console.error("An unexpected error occured", error);
    }
  }
}