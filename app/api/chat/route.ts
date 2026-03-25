import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { ragContext } from '@/lib/portfolio-data'
import { neon } from '@neondatabase/serverless'

export const maxDuration = 30
const VECTOR_STORE_ID = 'vs_69c34c0041148191a9bc58aff18cbee6'

function extractUserText(message: UIMessage): string {
  const textParts = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text.trim())
    .filter(Boolean)

  return textParts.join('\n')
}

async function fetchVectorContext(query: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || !query.trim()) return ''

  const response = await fetch(`https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_num_results: 5,
      rewrite_query: true,
    }),
  })

  if (!response.ok) return ''

  const payload = await response.json()
  const snippets = (payload?.data ?? [])
    .flatMap((item: { content?: Array<{ type: string; text?: string }> }) => item.content ?? [])
    .filter((entry: { type?: string; text?: string }) => entry.type === 'text' && entry.text)
    .map((entry: { text?: string }) => entry.text?.trim())
    .filter(Boolean)

  return snippets.join('\n\n').slice(0, 12000)
}

async function persistChatLog(message: string, response: string, referer: string | null) {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return
    const sql = neon(dbUrl)
    await sql`
      INSERT INTO chat_logs (user_id, referer, message, response)
      VALUES (1, ${referer}, ${message}, ${response})
    `
  } catch (error) {
    console.error('Failed to persist chat log:', error)
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Use OpenAI with user-provided API key
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')
  const userQuery = lastUserMessage ? extractUserText(lastUserMessage) : ''
  const vectorContext = await fetchVectorContext(userQuery)
  const referer = req.headers.get('referer') || null

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

${vectorContext ? `ADDITIONAL RETRIEVED CONTEXT (VECTOR STORE ${VECTOR_STORE_ID}):\n${vectorContext}` : ''}

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
    onFinish: async ({ responseMessage }) => {
      const responseText = responseMessage.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text.trim())
        .filter(Boolean)
        .join('\n')

      await persistChatLog(userQuery || '', responseText || '', referer)
    },
  })
}
