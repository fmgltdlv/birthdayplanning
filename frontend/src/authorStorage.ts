export const AUTHOR_KEY = 'capsule-author-name';

export function loadAuthorName(): string {
  return localStorage.getItem(AUTHOR_KEY) ?? '';
}

export function saveAuthorName(name: string): void {
  localStorage.setItem(AUTHOR_KEY, name);
}

export function trimAuthorName(name: string): string {
  return name.trim();
}

export function requireAuthorName(name: string): string {
  const trimmed = trimAuthorName(name);
  if (!trimmed) {
    throw new Error('Your name is required');
  }
  return trimmed;
}
