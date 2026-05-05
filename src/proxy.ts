import { NextRequest, NextResponse } from 'next/server';
import { regions, defaultRegion } from '@/config/regions';

function getSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');

  // me.localhost → "me"
  if (hostname.includes('localhost')) {
    return parts.length >= 2 ? parts[0] : null;
  }

  // me.dogcare.ru (3+ parts) vs dogcare.ru (2 parts)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return;
  }

  const subdomain = getSubdomain(hostname);

  // No subdomain → redirect to default region subdomain
  if (!subdomain) {
    const protocol = request.nextUrl.protocol;
    const port = request.nextUrl.port ? `:${request.nextUrl.port}` : '';
    const baseDomain = hostname.includes('localhost') ? 'localhost' : hostname;
    const redirectUrl = `${protocol}//${defaultRegion}.${baseDomain}${port}${pathname || '/'}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(redirectUrl));
  }

  // Invalid subdomain → 404
  const regionConfig = regions[subdomain];
  if (!regionConfig) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // Check if path starts with a locale segment
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Root of subdomain → redirect to default language
  if (!firstSegment) {
    const redirectUrl = new URL(`/${regionConfig.defaultLanguage}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if first segment is a supported language for this region
  const isLanguageSegment = regionConfig.languages.includes(firstSegment);

  if (!isLanguageSegment) {
    // If it looks like a locale code (2 chars) but not supported → 404
    if (firstSegment.length === 2) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
    // Otherwise redirect with default language prepended
    const redirectUrl = new URL(`/${regionConfig.defaultLanguage}${pathname}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // All good — set region cookies and continue
  const response = NextResponse.next();
  response.cookies.set('x-region', subdomain, { path: '/' });
  response.cookies.set('x-country', subdomain.toUpperCase(), { path: '/' });

  // Set default currency if not already set
  const existingCurrency = request.cookies.get('preferred_currency');
  if (!existingCurrency) {
    response.cookies.set('preferred_currency', regionConfig.currency, { path: '/' });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
