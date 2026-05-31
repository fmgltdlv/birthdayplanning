import { useEffect, useState } from 'react';
import { getCountdown, formatDisplayDate } from '../utils/countdown';

interface CountdownProps {
  herName: string;
  birthdayDate: string;
}

export function Countdown({ herName, birthdayDate }: CountdownProps) {
  const [parts, setParts] = useState(() => getCountdown(birthdayDate));

  useEffect(() => {
    const tick = () => setParts(getCountdown(birthdayDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [birthdayDate]);

  return (
    <section className="hero">
      <p className="hero-eyebrow">Planning something special for</p>
      <h1 className="hero-title">{herName}&apos;s Birthday</h1>
      <p className="hero-date">{formatDisplayDate(birthdayDate)}</p>

      {!parts.hasDate && (
        <p className="hero-hint">Add her birthday date in Settings to start the countdown.</p>
      )}

      {parts.hasDate && parts.isToday && (
        <div className="countdown-today">
          <span className="countdown-today-label">Today is the day!</span>
          <span className="countdown-today-sub">Make it magical.</span>
        </div>
      )}

      {parts.hasDate && !parts.isToday && (
        <div className="countdown-grid" aria-label="Countdown to birthday">
          {[
            { value: parts.days, label: 'Days' },
            { value: parts.hours, label: 'Hours' },
            { value: parts.minutes, label: 'Minutes' },
            { value: parts.seconds, label: 'Seconds' },
          ].map(({ value, label }) => (
            <div key={label} className="countdown-cell">
              <span className="countdown-value">{String(value).padStart(2, '0')}</span>
              <span className="countdown-label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
