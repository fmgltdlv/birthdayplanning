import { createDefaultPlan, type BirthdayPlan } from './defaultPlan';
import {
  createPlan,
  deletePlan,
  getPlan,
  savePlan,
} from './plans';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  CORS_ORIGIN?: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function corsHeaders(env: Env, request: Request): HeadersInit {
  const origin = request.headers.get('Origin');
  const allowed = env.CORS_ORIGIN ?? origin ?? '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(
  data: unknown,
  status = 200,
  extra: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

function error(message: string, status: number, cors: HeadersInit): Response {
  return json({ error: message }, status, cors);
}

async function handleApi(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const cors = corsHeaders(env, request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/api/health' && request.method === 'GET') {
    return json({ ok: true, service: 'birthday-planner-api' }, 200, cors);
  }

  if (path === '/api/plans' && request.method === 'POST') {
    let initial: BirthdayPlan | undefined;
    try {
      const body = (await request.json()) as { plan?: BirthdayPlan };
      initial = body?.plan;
    } catch {
      /* empty body is fine */
    }
    const created = await createPlan(env.DB, initial);
    return json(
      {
        id: created.id,
        secret: created.secret,
        plan: created.plan,
        updatedAt: Math.floor(Date.now() / 1000),
      },
      201,
      cors,
    );
  }

  const planMatch = path.match(/^\/api\/plans\/([^/]+)$/);
  if (!planMatch) {
    return error('Not found', 404, cors);
  }

  const planId = decodeURIComponent(planMatch[1]);

  if (request.method === 'GET') {
    const secret = url.searchParams.get('secret') ?? '';
    if (!secret) return error('Missing secret', 401, cors);

    const result = await getPlan(env.DB, planId, secret);
    if (!result) return error('Plan not found or invalid secret', 404, cors);

    return json(
      { id: planId, plan: result.plan, updatedAt: result.updatedAt },
      200,
      cors,
    );
  }

  if (request.method === 'PUT') {
    let body: { secret?: string; plan?: BirthdayPlan };
    try {
      body = (await request.json()) as { secret?: string; plan?: BirthdayPlan };
    } catch {
      return error('Invalid JSON body', 400, cors);
    }

    if (!body.secret || !body.plan) {
      return error('Body must include secret and plan', 400, cors);
    }

    const saved = await savePlan(env.DB, planId, body.secret, body.plan);
    if (!saved) return error('Plan not found or invalid secret', 404, cors);

    return json(
      { id: planId, ok: true, updatedAt: Math.floor(Date.now() / 1000) },
      200,
      cors,
    );
  }

  if (request.method === 'DELETE') {
    const secret = url.searchParams.get('secret') ?? '';
    if (!secret) return error('Missing secret', 401, cors);

    const removed = await deletePlan(env.DB, planId, secret);
    if (!removed) return error('Plan not found or invalid secret', 404, cors);

    return json({ id: planId, ok: true }, 200, cors);
  }

  return error('Method not allowed', 405, cors);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api')) {
      try {
        return await handleApi(request, env);
      } catch (e) {
        console.error(e);
        const cors = corsHeaders(env, request);
        return error('Internal server error', 500, cors);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
