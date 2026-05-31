import { useState } from 'react';
import { useBirthdayStore } from './hooks/useBirthdayStore';
import { Countdown } from './components/Countdown';
import { NavTabs, type TabId } from './components/NavTabs';
import { SectionCard } from './components/SectionCard';
import { OverviewPanel } from './components/OverviewPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { GiftsPanel } from './components/GiftsPanel';
import { ChecklistPanel } from './components/ChecklistPanel';
import { GuestsPanel } from './components/GuestsPanel';
import { MenuPanel } from './components/MenuPanel';
import { SurprisesPanel } from './components/SurprisesPanel';
import { LoveNotesPanel } from './components/LoveNotesPanel';
import { BudgetPanel } from './components/BudgetPanel';

function App() {
  const { plan, updatePlan, resetPlan } = useBirthdayStore();
  const [tab, setTab] = useState<TabId>('overview');

  const setSettings = (settings: typeof plan.settings) =>
    updatePlan((p) => ({ ...p, settings }));

  return (
    <div className="app">
      <div className="app-bg" aria-hidden />
      <header className="app-header">
        <Countdown
          herName={plan.settings.herName}
          birthdayDate={plan.settings.birthdayDate}
        />
      </header>

      <NavTabs active={tab} onChange={setTab} />

      <main className="app-main">
        {tab === 'overview' && (
          <SectionCard title="Dashboard" subtitle="Your planning at a glance">
            <OverviewPanel plan={plan} onNavigate={(t) => setTab(t as TabId)} />
          </SectionCard>
        )}

        {tab === 'settings' && (
          <SectionCard
            title="Settings"
            subtitle="Personalize her celebration"
            actions={
              <button type="button" className="btn btn-ghost" onClick={resetPlan}>
                Reset all data
              </button>
            }
          >
            <SettingsPanel settings={plan.settings} onChange={setSettings} />
          </SectionCard>
        )}

        {tab === 'gifts' && (
          <SectionCard title="Gift Ideas" subtitle="Track ideas from spark to wrap">
            <GiftsPanel
              gifts={plan.gifts}
              onChange={(gifts) => updatePlan((p) => ({ ...p, gifts }))}
            />
          </SectionCard>
        )}

        {tab === 'checklist' && (
          <SectionCard title="Party Checklist" subtitle="Nothing slips through the cracks">
            <ChecklistPanel
              items={plan.checklist}
              onChange={(checklist) => updatePlan((p) => ({ ...p, checklist }))}
            />
          </SectionCard>
        )}

        {tab === 'guests' && (
          <SectionCard title="Guest List" subtitle="RSVPs, dietary needs, and plus-ones">
            <GuestsPanel
              guests={plan.guests}
              onChange={(guests) => updatePlan((p) => ({ ...p, guests }))}
            />
          </SectionCard>
        )}

        {tab === 'menu' && (
          <SectionCard title="Menu & Cake" subtitle="Food and drinks she will adore">
            <MenuPanel
              menu={plan.menu}
              onChange={(menu) => updatePlan((p) => ({ ...p, menu }))}
            />
          </SectionCard>
        )}

        {tab === 'surprises' && (
          <SectionCard
            title="Surprise Timeline"
            subtitle="Secret moments throughout the day"
          >
            <SurprisesPanel
              surprises={plan.surprises}
              onChange={(surprises) => updatePlan((p) => ({ ...p, surprises }))}
            />
          </SectionCard>
        )}

        {tab === 'notes' && (
          <SectionCard
            title="Love Notes"
            subtitle="Words for her card, toast, or letter"
          >
            <LoveNotesPanel
              notes={plan.loveNotes}
              onChange={(loveNotes) => updatePlan((p) => ({ ...p, loveNotes }))}
            />
          </SectionCard>
        )}

        {tab === 'budget' && (
          <SectionCard title="Budget" subtitle="Keep the celebration on track">
            <BudgetPanel
              budget={plan.budget}
              onChange={(budget) => updatePlan((p) => ({ ...p, budget }))}
            />
          </SectionCard>
        )}
      </main>

      <footer className="app-footer">
        <p>Made with love · All data stays private on your device</p>
      </footer>
    </div>
  );
}

export default App;
