import type { Gift, GiftStatus } from '../types';

interface GiftsPanelProps {
  gifts: Gift[];
  onChange: (gifts: Gift[]) => void;
}

const STATUSES: { value: GiftStatus; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'wrapped', label: 'Wrapped' },
  { value: 'given', label: 'Given' },
];

export function GiftsPanel({ gifts, onChange }: GiftsPanelProps) {
  const addGift = () => {
    onChange([
      ...gifts,
      {
        id: crypto.randomUUID(),
        name: '',
        notes: '',
        estimatedCost: 0,
        status: 'idea',
        link: '',
      },
    ]);
  };

  const update = (id: string, patch: Partial<Gift>) => {
    onChange(gifts.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const remove = (id: string) => {
    onChange(gifts.filter((g) => g.id !== id));
  };

  const total = gifts.reduce((sum, g) => sum + (g.estimatedCost || 0), 0);

  return (
    <div>
      <div className="panel-toolbar">
        <button type="button" className="btn btn-primary" onClick={addGift}>
          + Add gift idea
        </button>
        {gifts.length > 0 && (
          <span className="muted">Estimated total: ${total.toFixed(2)}</span>
        )}
      </div>

      {gifts.length === 0 ? (
        <p className="empty-state">Jot down gift ideas as they come to you.</p>
      ) : (
        <ul className="item-list">
          {gifts.map((gift) => (
            <li key={gift.id} className="item-row">
              <div className="item-row-main">
                <input
                  className="item-title-input"
                  type="text"
                  value={gift.name}
                  onChange={(e) => update(gift.id, { name: e.target.value })}
                  placeholder="Gift name"
                />
                <select
                  value={gift.status}
                  onChange={(e) =>
                    update(gift.id, { status: e.target.value as GiftStatus })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="cost-input"
                  value={gift.estimatedCost || ''}
                  onChange={(e) =>
                    update(gift.id, {
                      estimatedCost: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="$"
                />
              </div>
              <input
                type="url"
                className="item-sub-input"
                value={gift.link}
                onChange={(e) => update(gift.id, { link: e.target.value })}
                placeholder="Link (optional)"
              />
              <textarea
                className="item-notes"
                value={gift.notes}
                onChange={(e) => update(gift.id, { notes: e.target.value })}
                placeholder="Notes — size, color, where to buy..."
                rows={2}
              />
              <button
                type="button"
                className="btn btn-ghost btn-danger-text"
                onClick={() => remove(gift.id)}
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
