export const MAX_AUTHOR_LEN = 50;
export const MAX_BODY_LEN = 1500;

export function authorLengthError(name: string): string | null {
  if (name.length > MAX_AUTHOR_LEN) {
    return `Name must be ${MAX_AUTHOR_LEN} characters or fewer`;
  }
  return null;
}

export function bodyLengthError(text: string, label: 'Note' | 'Caption'): string | null {
  if (text.length > MAX_BODY_LEN) {
    return `${label} must be ${MAX_BODY_LEN} characters or fewer`;
  }
  return null;
}
