import type { BudgetEntry } from '../types';

interface BudgetPanelProps {
  budget: BudgetEntry[];
  onChange: (budget: BudgetEntry[]) => void;
}

export function BudgetPanel({ budget, onChange }: BudgetPanelProps) {
  const addEntry = () => {
    onChange([
      ...budget,
      {
        id: crypto.randomUUID(),
        label: '',
        amount: 0,
        category: 'General',
      },
    ]);
  };

  const update = (id: string, patch: Partial<BudgetEntry>) => {
    onChange(budget.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const remove = (id: string) => {
    onChange(budget.filter((b) => b.id !== id));
  };

  const total = budget.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div>
      <div className="panel-toolbar">
        <button type="button" className="btn btn-primary" onClick={addEntry}>
          + Add expense
        </button>
        <span className="budget-total">Total: ${total.toFixed(2)}</span>
      </div>

      {budget.length === 0 ? (
        <p className="empty-state">Track spending so the celebration stays on budget.</p>
      ) : (
        <ul className="item-list">
          {budget.map((entry) => (
            <li key={entry.id} className="item-row budget-row">
              <input
                type="text"
                value={entry.label}
                onChange={(e) => update(entry.id, { label: e.target.value })}
                placeholder="What you bought"
              />
              <input
                type="text"
                value={entry.category}
                onChange={(e) => update(entry.id, { category: e.target.value })}
                placeholder="Category"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                className="cost-input"
                value={entry.amount || ''}
                onChange={(e) =>
                  update(entry.id, { amount: parseFloat(e.target.value) || 0 })
                }
                placeholder="$"
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => remove(entry.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
