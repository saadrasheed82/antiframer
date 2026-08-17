import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { ZodError } from 'zod'

export type ApiErrorCode = 'unauthorized' | 'invalid_body' | 'slug_conflict' | 'not_found' | 'internal'

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}

export function requireApiKey(request: Request): NextResponse | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return apiError('unauthorized', 'missing Authorization: Bearer header', 401)
  }
  const token = auth.slice('Bearer '.length)
  const expected = process.env.BLOG_API_KEY
  if (!expected) return apiError('internal', 'BLOG_API_KEY not configured', 500)

  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return apiError('unauthorized', 'invalid API key', 401)
  }
  return null
}

export function handleZodError(err: ZodError) {
  const first = err.issues[0]
  return apiError('invalid_body', `${first.path.join('.')}: ${first.message}`, 400)
}

export function handleUnknownError(context: string, err: unknown) {
  console.error(`[api:${context}]`, err)
  return apiError('internal', 'internal error', 500)
}
