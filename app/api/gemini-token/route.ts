import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/keys',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: apiKey,
          validDurationSecs: '300s',
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ accessToken: data.accessToken })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to get token' },
      { status: 500 }
    )
  }
}
