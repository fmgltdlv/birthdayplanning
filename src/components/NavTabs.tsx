export type TabId =
  | 'overview'
  | 'gifts'
  | 'checklist'
  | 'guests'
  | 'menu'
  | 'surprises'
  | 'notes'
  | 'budget'
  | 'settings';

interface NavTabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '✦' },
  { id: 'gifts', label: 'Gifts', icon: '🎁' },
  { id: 'checklist', label: 'Checklist', icon: '☑' },
  { id: 'guests', label: 'Guests', icon: '♥' },
  { id: 'menu', label: 'Menu', icon: '🍰' },
  { id: 'surprises', label: 'Surprises', icon: '✨' },
  { id: 'notes', label: 'Love Notes', icon: '💌' },
  { id: 'budget', label: 'Budget', icon: '◎' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export function NavTabs({ active, onChange }: NavTabsProps) {
  return (
    <nav className="nav-tabs" aria-label="Planning sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={active === tab.id ? 'nav-tab active' : 'nav-tab'}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden>
            {tab.icon}
          </span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
