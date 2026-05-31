import type { MenuItem } from '../types';

interface MenuPanelProps {
  menu: MenuItem[];
  onChange: (menu: MenuItem[]) => void;
}

const CATEGORIES: MenuItem['category'][] = [
  'appetizer',
  'main',
  'dessert',
  'cake',
  'drink',
];

export function MenuPanel({ menu, onChange }: MenuPanelProps) {
  const addItem = (category: MenuItem['category']) => {
    onChange([
      ...menu,
      {
        id: crypto.randomUUID(),
        name: '',
        category,
        notes: '',
      },
    ]);
  };

  const update = (id: string, patch: Partial<MenuItem>) => {
    onChange(menu.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const remove = (id: string) => {
    onChange(menu.filter((m) => m.id !== id));
  };

  return (
    <div>
      <div className="panel-toolbar menu-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => addItem(cat)}
          >
            + {cat}
          </button>
        ))}
      </div>

      {menu.length === 0 ? (
        <p className="empty-state">Plan the menu, cake, and drinks she will love.</p>
      ) : (
        <ul className="item-list">
          {menu.map((item) => (
            <li key={item.id} className="item-row menu-row">
              <span className="menu-badge">{item.category}</span>
              <input
                type="text"
                value={item.name}
                onChange={(e) => update(item.id, { name: e.target.value })}
                placeholder="Dish or drink name"
              />
              <input
                type="text"
                value={item.notes}
                onChange={(e) => update(item.id, { notes: e.target.value })}
                placeholder="Recipe, store, allergies..."
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => remove(item.id)}
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
