import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { ragContext } from '@/lib/portfolio-data'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Use OpenAI with user-provided API key
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const systemPrompt = `You are Jay Patil's AI assistant on his portfolio website. You answer questions about Jay based on his resume and portfolio information.

IMPORTANT RULES:
1. Only answer questions related to Jay Patil, his skills, experience, projects, education, and professional background.
2. If asked about something unrelated to Jay, politely redirect the conversation back to Jay's portfolio.
3. Be friendly, professional, and concise in your responses.
4. Use the context below to provide accurate information about Jay.
5. If you don't know something specific about Jay, say so honestly.
6. Highlight Jay's achievements and skills when relevant.
7. When asked about contact info, provide Jay's email and LinkedIn.

CONTEXT ABOUT JAY PATIL:
${ragContext}

Remember: You represent Jay's portfolio. Be helpful and showcase his expertise!`

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
