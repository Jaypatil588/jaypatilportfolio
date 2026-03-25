import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const resendApiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL || 'jaypatilsde@gmail.com'
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>'

  if (!resendApiKey) {
    return NextResponse.json(
      { error: 'Missing RESEND_API_KEY. Configure it in environment variables.' },
      { status: 500 }
    )
  }

  const payload = await req.json()
  const from = String(payload?.from || '').trim()
  const subject = String(payload?.subject || '').trim()
  const message = String(payload?.message || '').trim()

  if (!subject || !message) {
    return NextResponse.json(
      { error: 'Subject and message are required.' },
      { status: 400 }
    )
  }

  const textBody = [
    'You received a new message from your portfolio contact form.',
    '',
    `From: ${from || 'Not provided'}`,
    `Subject: ${subject}`,
    '',
    'Message:',
    message,
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `Portfolio: ${subject}`,
      text: textBody,
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    return NextResponse.json(
      { error: `Email send failed: ${errorPayload}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
