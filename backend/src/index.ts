import {
  getEntry,
  insertNote,
  insertPhoto,
  listEntries,
} from './entries';
import {
  putToR2,
  r2KeyFor,
  r2KeyForThumb,
  validateImage,
  MAX_THUMB_BYTES,
} from './uploads';

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
}

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function error(message: string, status: number): Response {
  return json({ error: message }, status);
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/api/health' && request.method === 'GET') {
    return json({ ok: true, service: 'bootybear-time-capsule' });
  }

  if (path === '/api/entries' && request.method === 'GET') {
    const limit = Math.min(200, parseInt(url.searchParams.get('limit') ?? '100', 10));
    const entries = await listEntries(env.DB, limit);
    return json({ entries });
  }

  if (path === '/api/entries/note' && request.method === 'POST') {
    let body: { authorName?: string; text?: string };
    try {
      body = (await request.json()) as { authorName?: string; text?: string };
    } catch {
      return error('Invalid JSON', 400);
    }

    const text = (body.text ?? '').trim();
    if (!text) return error('Note text is required', 400);

    const authorName = (body.authorName ?? '').trim();
    if (!authorName) return error('Your name is required', 400);
    const id = crypto.randomUUID();
    const entry = await insertNote(env.DB, id, authorName, text);
    return json({ entry }, 201);
  }

  if (path === '/api/entries/photo' && request.method === 'POST') {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return error('Expected multipart form data', 400);
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      return error('Missing image file', 400);
    }

    const validationError = validateImage(file);
    if (validationError) return error(validationError, 400);

    const thumbFile = form.get('thumb');
    let thumbKey: string | null = null;
    if (thumbFile instanceof File && thumbFile.size > 0) {
      const thumbErr = validateImage(thumbFile, MAX_THUMB_BYTES);
      if (thumbErr) return error(thumbErr, 400);
    }

    const authorName = String(form.get('authorName') ?? '').trim();
    if (!authorName) return error('Your name is required', 400);
    const caption = String(form.get('caption') ?? '').trim() || null;

    const id = crypto.randomUUID();
    const key = r2KeyFor(id, file.type);

    await putToR2(env.MEDIA, key, file);

    if (thumbFile instanceof File && thumbFile.size > 0) {
      thumbKey = r2KeyForThumb(id);
      await putToR2(env.MEDIA, thumbKey, thumbFile);
    }

    const entry = await insertPhoto(
      env.DB,
      id,
      authorName,
      caption,
      key,
      thumbKey,
      file.type,
    );

    return json({ entry }, 201);
  }

  const mediaMatch = path.match(/^\/api\/media\/([^/]+)$/);
  if (mediaMatch && request.method === 'GET') {
    const id = decodeURIComponent(mediaMatch[1]);
    const row = await getEntry(env.DB, id);
    if (!row || row.type !== 'photo' || !row.r2_key) {
      return error('Not found', 404);
    }

    const wantThumb = url.searchParams.get('size') === 'thumb';
    let objectKey = row.r2_key;
    if (wantThumb && row.r2_key_thumb) {
      objectKey = row.r2_key_thumb;
    }

    const object = await env.MEDIA.get(objectKey);
    if (!object) return error('File missing from storage', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=86400');

    return new Response(object.body, { headers });
  }

  return error('Not found', 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api')) {
      try {
        return await handleApi(request, env);
      } catch (e) {
        console.error(e);
        return error('Internal server error', 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
