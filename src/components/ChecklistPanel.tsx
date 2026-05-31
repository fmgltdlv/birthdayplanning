import type { ChecklistItem } from '../types';

interface ChecklistPanelProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistPanel({ items, onChange }: ChecklistPanelProps) {
  const categories = [...new Set(items.map((i) => i.category))];
  const doneCount = items.filter((i) => i.done).length;

  const toggle = (id: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        label: 'New task',
        done: false,
        category: 'Custom',
      },
    ]);
  };

  const updateLabel = (id: string, label: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, label } : i)));
  };

  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <div>
      <div className="panel-toolbar">
        <button type="button" className="btn btn-primary" onClick={addItem}>
          + Add task
        </button>
        <span className="muted">
          {doneCount} of {items.length} complete
        </span>
      </div>

      <div className="progress-bar" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={items.length || 1}>
        <div
          className="progress-fill"
          style={{
            width: items.length ? `${(doneCount / items.length) * 100}%` : '0%',
          }}
        />
      </div>

      {categories.map((cat) => (
        <div key={cat} className="checklist-group">
          <h3 className="checklist-category">{cat}</h3>
          <ul className="checklist">
            {items
              .filter((i) => i.category === cat)
              .map((item) => (
                <li key={item.id} className={item.done ? 'checklist-item done' : 'checklist-item'}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggle(item.id)}
                    />
                    <input
                      type="text"
                      className="checklist-label-input"
                      value={item.label}
                      onChange={(e) => updateLabel(item.id, e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => remove(item.id)}
                    aria-label="Remove task"
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
