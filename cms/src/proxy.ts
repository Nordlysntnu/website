import { NextResponse, type NextRequest } from 'next/server.js'

// Use the same cookie as Payload's theme selector, including on the first render.
export function proxy(request: NextRequest) {
  const theme = request.cookies.get('payload-theme')?.value
  if (theme === 'light' || theme === 'dark') return NextResponse.next()
  const headers = new Headers(request.headers)
  const cookies = request.headers.get('cookie')?.split(';').filter(item => !item.trim().startsWith('payload-theme=')).join('; ')
  headers.set('cookie', [cookies, 'payload-theme=dark'].filter(Boolean).join('; '))
  const response = NextResponse.next({ request: { headers } })
  response.cookies.set('payload-theme', 'dark', {
    path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  })
  return response
}
export const config = { matcher: ['/((?!api|_next|favicon.ico).*)'] }
