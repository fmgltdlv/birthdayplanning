const PRODUCTION_ORIGIN =
  'https://birthdayplanning.thefieldmappinggroup.workers.dev';

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "connect-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export interface SecurityEnv {
  ALLOWED_ORIGINS?: string;
}

function allowedOrigins(env: SecurityEnv, requestUrl: URL): Set<string> {
  const origins = new Set<string>([
    PRODUCTION_ORIGIN,
    `${requestUrl.protocol}//${requestUrl.host}`,
    ...DEV_ORIGINS,
  ]);

  const extra = env.ALLOWED_ORIGINS?.trim();
  if (extra) {
    for (const part of extra.split(',')) {
      const o = part.trim();
      if (o) origins.add(o);
    }
  }

  return origins;
}

function isAllowedOrigin(
  origin: string,
  env: SecurityEnv,
  requestUrl: URL,
): boolean {
  return allowedOrigins(env, requestUrl).has(origin);
}

function applyCors(headers: Headers, origin: string): void {
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');
}

export function corsPreflightResponse(
  request: Request,
  env: SecurityEnv,
): Response | null {
  if (request.method !== 'OPTIONS') return null;

  const origin = request.headers.get('Origin');
  const requestUrl = new URL(request.url);
  if (!origin || !isAllowedOrigin(origin, env, requestUrl)) {
    return new Response(null, { status: 403 });
  }

  const headers = new Headers();
  applyCors(headers, origin);
  return new Response(null, { status: 204, headers });
}

export function withApiSecurity(
  response: Response,
  request: Request,
  env: SecurityEnv,
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');

  const contentType = headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json') && !headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-store');
  }

  const origin = request.headers.get('Origin');
  const requestUrl = new URL(request.url);
  if (origin && isAllowedOrigin(origin, env, requestUrl)) {
    applyCors(headers, origin);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function withAssetSecurity(
  response: Response,
  request: Request,
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=()',
  );

  const contentType = headers.get('Content-Type') ?? '';
  if (contentType.includes('text/html')) {
    headers.set('Content-Security-Policy', CSP);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
