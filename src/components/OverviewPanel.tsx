import type { BirthdayPlan } from '../types';

interface OverviewPanelProps {
  plan: BirthdayPlan;
  onNavigate: (tab: string) => void;
}

export function OverviewPanel({ plan, onNavigate }: OverviewPanelProps) {
  const giftsDone = plan.gifts.filter((g) => g.status === 'wrapped' || g.status === 'given').length;
  const checklistDone = plan.checklist.filter((c) => c.done).length;
  const guestsYes = plan.guests.filter((g) => g.rsvp === 'yes').length;
  const budgetTotal = plan.budget.reduce((s, b) => s + b.amount, 0);
  const giftBudget = plan.gifts.reduce((s, g) => s + g.estimatedCost, 0);

  const cards = [
    {
      title: 'Party theme',
      value: plan.settings.partyTheme || 'Not set yet',
      tab: 'settings',
    },
    {
      title: 'Venue',
      value: plan.settings.venue || 'Add in Settings',
      tab: 'settings',
    },
    {
      title: 'Gifts ready',
      value: `${giftsDone} / ${plan.gifts.length}`,
      tab: 'gifts',
    },
    {
      title: 'Checklist',
      value: `${checklistDone} / ${plan.checklist.length}`,
      tab: 'checklist',
    },
    {
      title: 'Guests confirmed',
      value: `${guestsYes} of ${plan.guests.length}`,
      tab: 'guests',
    },
    {
      title: 'Surprise moments',
      value: String(plan.surprises.length),
      tab: 'surprises',
    },
    {
      title: 'Love notes drafted',
      value: String(plan.loveNotes.length),
      tab: 'notes',
    },
    {
      title: 'Estimated spend',
      value: `$${(budgetTotal + giftBudget).toFixed(2)}`,
      tab: 'budget',
    },
  ];

  return (
    <div className="overview">
      <p className="overview-intro">
        Everything you need to plan an unforgettable birthday for{' '}
        <strong>{plan.settings.herName}</strong>. Your progress saves automatically
        in this browser.
      </p>
      <div className="overview-grid">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            className="overview-card"
            onClick={() => onNavigate(card.tab)}
          >
            <span className="overview-card-title">{card.title}</span>
            <span className="overview-card-value">{card.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
