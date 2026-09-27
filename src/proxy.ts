import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { isLocale, LOCALE_COOKIE, LOCALE_MAX_AGE } from './i18n/config'
import { detectLocale } from './i18n/detect'

export function proxy(request: NextRequest) {
  const previewLocale = request.nextUrl.searchParams.get('lng')
  const requestHeaders = new Headers(request.headers)
  if (isLocale(previewLocale)) {
    requestHeaders.set('x-preview-locale', previewLocale)
  }

  const current = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(previewLocale) || isLocale(current)) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  const locale = detectLocale(request.headers.get('accept-language'))
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_MAX_AGE,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|api/media).*)'],
}
