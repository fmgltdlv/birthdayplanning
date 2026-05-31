export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
  isPast: boolean;
  hasDate: boolean;
}

export function getCountdown(birthdayDate: string): CountdownParts {
  if (!birthdayDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isToday: false,
      isPast: false,
      hasDate: false,
    };
  }

  const now = new Date();
  const [y, m, d] = birthdayDate.split('-').map(Number);
  let target = new Date(y, m - 1, d, 0, 0, 0);

  if (target < now && !isSameDay(target, now)) {
    target = new Date(y + 1, m - 1, d, 0, 0, 0);
  }

  const diff = target.getTime() - now.getTime();
  const isToday = isSameDay(target, now);
  const isPast = diff < 0 && !isToday;

  if (isToday) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true, isPast: false, hasDate: true };
  }

  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isToday, isPast, hasDate: true };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return 'Set her birthday in Settings';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
