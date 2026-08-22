import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { negotiateMarkdown } from '@/lib/accept';

const VARY_ACCEPT = 'Accept, Accept-Encoding';

// Union of the existing Vary values with the tokens required by content
// negotiation, so CDNs key cached variants on the Accept header.
function mergeVary(existing: string | null): string {
  const tokens = new Set(
    (existing ?? '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean),
  );
  for (const token of VARY_ACCEPT.split(',')) {
    tokens.add(token.trim());
  }
  return [...tokens].join(', ');
}

// Only real page navigations participate in negotiation: skip Next.js RSC
// flights/prefetches and browser sub-resource fetches.
// Note: Next 16 strips rsc/next-router-* headers before proxy, so flights are
// detected via their distinctive Accept: text/x-component instead.
function isDocumentRequest(request: NextRequest): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const accept = request.headers.get('accept');
  if (accept && accept.includes('text/x-component')) return false;
  if (
    request.headers.get('rsc') ||
    request.headers.get('next-router-prefetch') ||
    request.headers.get('next-router-state-tree')
  ) {
    return false;
  }
  const secFetchDest = request.headers.get('sec-fetch-dest');
  if (secFetchDest && secFetchDest !== 'document') return false;
  return true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener el token de las cookies
  const accessToken = request.cookies.get('access_token')?.value;

  // Rutas del dashboard (excepto login)
  const isDashboardRoute = pathname.startsWith('/dashboard') && pathname !== '/dashboard/login';

  // Si intenta acceder al dashboard sin token, redirigir al login
  if (isDashboardRoute && !accessToken) {
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya está logueado y va al login, redirigir al dashboard
  if (pathname === '/dashboard/login' && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // --- Content negotiation: Accept: text/markdown (acceptmarkdown.com) ---
  if (isDocumentRequest(request)) {
    const decision = negotiateMarkdown(request.headers.get('accept'));

    if (decision === 'markdown') {
      const mdUrl = request.nextUrl.clone();
      mdUrl.pathname = pathname === '/' ? '/md' : `/md${pathname}`;
      return NextResponse.rewrite(mdUrl);
    }

    if (decision === 'not-acceptable') {
      return new NextResponse(
        '406 Not Acceptable: this resource provides text/html and text/markdown only.\nRetry with "Accept: text/html" or "Accept: text/markdown".\nSite index for agents: /llms.txt\n',
        {
          status: 406,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            Vary: VARY_ACCEPT,
          },
        },
      );
    }

    // HTML variant: advertise that the representation varies with Accept.
    const response = NextResponse.next();
    response.headers.set('Vary', mergeVary(response.headers.get('vary')));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    // Public document paths only: exclude API routes, internal Next.js paths,
    // the /md handler itself, and anything that looks like a static asset.
    '/((?!api|_next|md|dashboard|.*\\..*).*)',
  ],
};
