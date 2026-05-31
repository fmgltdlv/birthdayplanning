import type { Guest } from '../types';

interface GuestsPanelProps {
  guests: Guest[];
  onChange: (guests: Guest[]) => void;
}

const RSVP_OPTIONS: Guest['rsvp'][] = ['pending', 'yes', 'no', 'maybe'];

export function GuestsPanel({ guests, onChange }: GuestsPanelProps) {
  const addGuest = () => {
    onChange([
      ...guests,
      {
        id: crypto.randomUUID(),
        name: '',
        email: '',
        rsvp: 'pending',
        dietary: '',
        plusOne: false,
      },
    ]);
  };

  const update = (id: string, patch: Partial<Guest>) => {
    onChange(guests.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const remove = (id: string) => {
    onChange(guests.filter((g) => g.id !== id));
  };

  const yesCount = guests.filter((g) => g.rsvp === 'yes').length;

  return (
    <div>
      <div className="panel-toolbar">
        <button type="button" className="btn btn-primary" onClick={addGuest}>
          + Add guest
        </button>
        <span className="muted">
          {yesCount} confirmed · {guests.length} invited
        </span>
      </div>

      {guests.length === 0 ? (
        <p className="empty-state">Build your guest list and track RSVPs.</p>
      ) : (
        <ul className="item-list">
          {guests.map((guest) => (
            <li key={guest.id} className="item-row guest-row">
              <div className="item-row-main">
                <input
                  type="text"
                  value={guest.name}
                  onChange={(e) => update(guest.id, { name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) => update(guest.id, { email: e.target.value })}
                  placeholder="Email"
                />
                <select
                  value={guest.rsvp}
                  onChange={(e) =>
                    update(guest.id, { rsvp: e.target.value as Guest['rsvp'] })
                  }
                  className={`rsvp rsvp-${guest.rsvp}`}
                >
                  {RSVP_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="item-row-main">
                <input
                  type="text"
                  value={guest.dietary}
                  onChange={(e) => update(guest.id, { dietary: e.target.value })}
                  placeholder="Dietary needs"
                />
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={guest.plusOne}
                    onChange={(e) => update(guest.id, { plusOne: e.target.checked })}
                  />
                  Plus one
                </label>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-danger-text"
                onClick={() => remove(guest.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
