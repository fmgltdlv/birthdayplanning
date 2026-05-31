import type { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const update = (patch: Partial<AppSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <div className="form-grid">
      <label className="field">
        <span>Her name</span>
        <input
          type="text"
          value={settings.herName}
          onChange={(e) => update({ herName: e.target.value })}
          placeholder="Her name"
        />
      </label>
      <label className="field">
        <span>Birthday date</span>
        <input
          type="date"
          value={settings.birthdayDate}
          onChange={(e) => update({ birthdayDate: e.target.value })}
        />
      </label>
      <label className="field field-full">
        <span>Party theme</span>
        <input
          type="text"
          value={settings.partyTheme}
          onChange={(e) => update({ partyTheme: e.target.value })}
          placeholder="Garden party, cozy dinner, surprise trip..."
        />
      </label>
      <label className="field field-full">
        <span>Venue / location</span>
        <input
          type="text"
          value={settings.venue}
          onChange={(e) => update({ venue: e.target.value })}
          placeholder="Home, restaurant, park..."
        />
      </label>
    </div>
  );
}
