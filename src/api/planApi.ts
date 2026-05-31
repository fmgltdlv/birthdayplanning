import type { BirthdayPlan } from '../types';

export interface PlanCredentials {
  id: string;
  secret: string;
}

const CREDENTIALS_KEY = 'birthday-plan-credentials';

export function getStoredCredentials(): PlanCredentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanCredentials;
    if (parsed.id && parsed.secret) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function storeCredentials(credentials: PlanCredentials): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
}

function apiBase(): string {
  return import.meta.env.VITE_API_BASE ?? '';
}

export async function createCloudPlan(
  plan?: BirthdayPlan,
): Promise<{
  credentials: PlanCredentials;
  plan: BirthdayPlan;
  updatedAt: number;
}> {
  const res = await fetch(`${apiBase()}/api/plans`, {
    method: 'POST',
    headers: plan ? { 'Content-Type': 'application/json' } : undefined,
    body: plan ? JSON.stringify({ plan }) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to create plan');
  }
  const data = (await res.json()) as {
    id: string;
    secret: string;
    plan: BirthdayPlan;
    updatedAt: number;
  };
  const credentials = { id: data.id, secret: data.secret };
  storeCredentials(credentials);
  return { credentials, plan: data.plan, updatedAt: data.updatedAt };
}

export async function fetchCloudPlan(
  credentials: PlanCredentials,
): Promise<{ plan: BirthdayPlan; updatedAt: number }> {
  const params = new URLSearchParams({ secret: credentials.secret });
  const res = await fetch(
    `${apiBase()}/api/plans/${encodeURIComponent(credentials.id)}?${params}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to load plan');
  }
  const data = (await res.json()) as {
    plan: BirthdayPlan;
    updatedAt: number;
  };
  return { plan: data.plan, updatedAt: data.updatedAt };
}

export async function saveCloudPlan(
  credentials: PlanCredentials,
  plan: BirthdayPlan,
): Promise<number> {
  const res = await fetch(
    `${apiBase()}/api/plans/${encodeURIComponent(credentials.id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: credentials.secret, plan }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to save plan');
  }
  const data = (await res.json()) as { updatedAt: number };
  return data.updatedAt;
}

export async function deleteCloudPlan(credentials: PlanCredentials): Promise<void> {
  const params = new URLSearchParams({ secret: credentials.secret });
  const res = await fetch(
    `${apiBase()}/api/plans/${encodeURIComponent(credentials.id)}?${params}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to delete plan');
  }
  clearCredentials();
}
