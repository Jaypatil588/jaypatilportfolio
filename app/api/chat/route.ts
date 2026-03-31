import {
  convertToModelMessages,
  streamText,
  generateText,
  UIMessage,
} from 'ai'
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

  try {
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
  } catch {
    return ''
  }
}

async function classifyPortfolioQuery(query: string): Promise<0 | 1> {
  if (!query.trim()) return 1 // Allow empty queries to proceed

  try {
    const classifierPrompt = `You are a strict binary intent classifier for Jay Patil portfolio chatbot.
Task: Decide whether the user query is in-scope for Jay portfolio assistant.

Return "1" if the query is about ANY of the following:
- Jay Patil profile/about/bio/introduction
- Jay skills/tech stack/languages/tools/frameworks
- Jay projects, GitHub repos, achievements, education, work history
- Jay resume, contact info, location, LinkedIn, portfolio sections
- Questions phrased as "your/you/me/my" that clearly refer to Jay assistant context
- General greetings or conversation starters

Return "0" if the query is outside scope, including:
- General knowledge unrelated to Jay
- Requests for harmful/illegal content
- Tasks unrelated to Jay portfolio information

Output exactly one character only: 0 or 1`

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: classifierPrompt,
      prompt: query,
      maxOutputTokens: 5,
    })

    const raw = result.text.trim()
    const digit = raw.match(/[01]/)?.[0]
    return digit === '0' ? 0 : 1
  } catch (error) {
    console.error('[classifier] check failed', error)
    return 1 // Default to allowing the query on error
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
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')
    const userQuery = lastUserMessage ? extractUserText(lastUserMessage) : ''
    const referer = req.headers.get('referer') || null
    const decision = await classifyPortfolioQuery(userQuery)

    if (decision === 0) {
      const rejectionMessage = "I'm Jay's portfolio assistant - I can only help with questions about Jay's skills, experience, projects, and background. Feel free to ask me about those!"
      
      // Persist the rejection
      await persistChatLog(userQuery || '', rejectionMessage, referer)
      
      // Return a simple streaming response for rejections
      const result = streamText({
        model: 'openai/gpt-4o-mini',
        prompt: rejectionMessage,
        maxOutputTokens: 1,
      })
      
      // Override with our rejection message
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(`data: {"type":"start"}\n\n`))
            controller.enqueue(encoder.encode(`data: {"type":"text-start","id":"rejection"}\n\n`))
            controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"rejection","delta":"${rejectionMessage}"}\n\n`))
            controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"rejection"}\n\n`))
            controller.enqueue(encoder.encode(`data: {"type":"finish","finishReason":"stop"}\n\n`))
            controller.close()
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      )
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
8. Always answer in first person as Jay. Each response must begin with "I" and should never begin with "Jay".

CONTEXT ABOUT JAY PATIL:
${ragContext}

${vectorContext ? `ADDITIONAL RETRIEVED CONTEXT (VECTOR STORE ${VECTOR_STORE_ID}):\n${vectorContext}` : ''}

Remember: You represent Jay's portfolio. Be helpful and showcase his expertise!`

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ responseMessage }) => {
        const responseText = responseMessage.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text.trim())
          .filter(Boolean)
          .join('\n')

        await persistChatLog(userQuery || '', responseText || '', referer)
      },
    })
  } catch (error) {
    console.error('[chat] error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
