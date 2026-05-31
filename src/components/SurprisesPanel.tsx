import type { SurpriseEvent } from '../types';

interface SurprisesPanelProps {
  surprises: SurpriseEvent[];
  onChange: (surprises: SurpriseEvent[]) => void;
}

export function SurprisesPanel({ surprises, onChange }: SurprisesPanelProps) {
  const addEvent = () => {
    onChange([
      ...surprises,
      {
        id: crypto.randomUUID(),
        time: '',
        title: '',
        description: '',
        secret: true,
      },
    ]);
  };

  const update = (id: string, patch: Partial<SurpriseEvent>) => {
    onChange(surprises.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const remove = (id: string) => {
    onChange(surprises.filter((s) => s.id !== id));
  };

  const sorted = [...surprises].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <div className="panel-toolbar">
        <button type="button" className="btn btn-primary" onClick={addEvent}>
          + Add moment
        </button>
        <span className="muted">Keep the timeline secret until the big day</span>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-state">
          Map out the surprise reveal, toast, or special activity.
        </p>
      ) : (
        <ol className="timeline">
          {sorted.map((event, index) => (
            <li key={event.id} className="timeline-item">
              <span className="timeline-marker">{index + 1}</span>
              <div className="timeline-content">
                <div className="item-row-main">
                  <input
                    type="time"
                    value={event.time}
                    onChange={(e) => update(event.id, { time: e.target.value })}
                  />
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => update(event.id, { title: e.target.value })}
                    placeholder="What happens"
                  />
                  <label className="inline-check">
                    <input
                      type="checkbox"
                      checked={event.secret}
                      onChange={(e) =>
                        update(event.id, { secret: e.target.checked })
                      }
                    />
                    Secret
                  </label>
                </div>
                <textarea
                  className="item-notes"
                  value={event.description}
                  onChange={(e) =>
                    update(event.id, { description: e.target.value })
                  }
                  placeholder="Details only you need to remember..."
                  rows={2}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-danger-text"
                  onClick={() => remove(event.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
