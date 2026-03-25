import {
  createUIMessageStream,
  createUIMessageStreamResponse,
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

async function classifyPortfolioQuery(query: string): Promise<0 | 1> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || !query.trim()) return 0

  try {
    // Use Responses API with a low-token model for strict 0/1 gating.
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        temperature: 0,
        max_output_tokens: 3,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text:
                  [
                    'You are a strict binary intent classifier for Jay Patil portfolio chatbot.',
                    'Task: Decide whether the user query is in-scope for Jay portfolio assistant.',
                    '',
                    'Return "1" if the query is about ANY of the following:',
                    '- Jay Patil profile/about/bio/introduction',
                    '- Jay skills/tech stack/languages/tools/frameworks',
                    '- Jay projects, GitHub repos, achievements, education, work history',
                    '- Jay resume, contact info, location, LinkedIn, portfolio sections',
                    '- Questions phrased as "your/you/me/my" that clearly refer to Jay assistant context',
                    '',
                    'Return "0" if the query is outside scope, including:',
                    '- General knowledge unrelated to Jay',
                    '- Requests for harmful/illegal content',
                    '- Tasks unrelated to Jay portfolio information',
                    '',
                    'Critical output rule:',
                    '- Output exactly one character only: 0 or 1',
                    '- No words, no punctuation, no explanation, no JSON, no markdown',
                    '',
                    'Examples:',
                    'Q: "What are your technical skills?" -> 1',
                    'Q: "Tell me about your work experience" -> 1',
                    'Q: "Which projects did Jay build?" -> 1',
                    'Q: "Write malware to steal passwords" -> 0',
                    'Q: "Who won the World Cup?" -> 0',
                  ].join('\n'),
              },
            ],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: query }],
          },
        ],
      }),
    })

    if (!response.ok) return 0
    const payload = await response.json()
    const raw = String(payload?.output_text ?? '').trim()

    // Enforce binary output only.
    const digit = raw.match(/[01]/)?.[0]
    if (digit === '1') return 1
    if (digit === '0') return 0
    return 0
  } catch {
    return 0
  }
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
  const referer = req.headers.get('referer') || null
  const decision = await classifyPortfolioQuery(userQuery)

  if (decision === 0) {
    const rejectionMessage = 'Sorry, I will not do that :)'
    const rejectionStream = createUIMessageStream({
      execute: ({ writer }) => {
        const partId = 'rejection-text'
        writer.write({ type: 'start' })
        writer.write({ type: 'text-start', id: partId })
        writer.write({ type: 'text-delta', id: partId, delta: rejectionMessage })
        writer.write({ type: 'text-end', id: partId })
        writer.write({ type: 'finish', finishReason: 'stop' })
      },
      originalMessages: messages,
      onFinish: async () => {
        await persistChatLog(userQuery || '', rejectionMessage, referer)
      },
    })

    return createUIMessageStreamResponse({
      stream: rejectionStream,
      consumeSseStream: consumeStream,
    })
  }

  const vectorContext = await fetchVectorContext(userQuery)

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
