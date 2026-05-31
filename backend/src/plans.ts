import { createDefaultPlan, mergePlan, type BirthdayPlan } from './defaultPlan';

export interface PlanRow {
  id: string;
  secret: string;
  data: string;
  created_at: number;
  updated_at: number;
}

export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

export function generateSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function getPlan(
  db: D1Database,
  id: string,
  secret: string,
): Promise<{ plan: BirthdayPlan; updatedAt: number } | null> {
  const row = await db
    .prepare('SELECT id, secret, data, updated_at FROM plans WHERE id = ?')
    .bind(id)
    .first<PlanRow>();

  if (!row || row.secret !== secret) return null;

  try {
    const parsed = JSON.parse(row.data) as BirthdayPlan;
    return { plan: mergePlan(parsed), updatedAt: row.updated_at };
  } catch {
    return { plan: createDefaultPlan(), updatedAt: row.updated_at };
  }
}

export async function createPlan(
  db: D1Database,
  initial?: BirthdayPlan,
): Promise<{
  id: string;
  secret: string;
  plan: BirthdayPlan;
}> {
  const id = generateId();
  const secret = generateSecret();
  const plan = initial ? mergePlan(initial) : createDefaultPlan();
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      'INSERT INTO plans (id, secret, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(id, secret, JSON.stringify(plan), now, now)
    .run();

  return { id, secret, plan };
}

export async function savePlan(
  db: D1Database,
  id: string,
  secret: string,
  plan: BirthdayPlan,
): Promise<boolean> {
  const existing = await db
    .prepare('SELECT secret FROM plans WHERE id = ?')
    .bind(id)
    .first<{ secret: string }>();

  if (!existing || existing.secret !== secret) return false;

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare('UPDATE plans SET data = ?, updated_at = ? WHERE id = ?')
    .bind(JSON.stringify(plan), now, id)
    .run();

  return true;
}

export async function deletePlan(
  db: D1Database,
  id: string,
  secret: string,
): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM plans WHERE id = ? AND secret = ?')
    .bind(id, secret)
    .run();

  return (result.meta.changes ?? 0) > 0;
}
