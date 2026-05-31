export interface BirthdayPlan {
  settings: {
    herName: string;
    birthdayDate: string;
    partyTheme: string;
    venue: string;
  };
  gifts: unknown[];
  checklist: unknown[];
  guests: unknown[];
  menu: unknown[];
  surprises: unknown[];
  loveNotes: unknown[];
  budget: unknown[];
}

const DEFAULT_CHECKLIST = [
  { label: 'Pick a date and send save-the-dates', done: false, category: 'Planning' },
  { label: 'Book venue or prepare home setup', done: false, category: 'Planning' },
  { label: 'Order or bake the birthday cake', done: false, category: 'Food' },
  { label: 'Plan the menu and groceries', done: false, category: 'Food' },
  { label: 'Buy decorations and flowers', done: false, category: 'Decor' },
  { label: 'Create a playlist', done: false, category: 'Ambiance' },
  { label: 'Wrap all gifts', done: false, category: 'Gifts' },
  { label: 'Confirm guest RSVPs', done: false, category: 'Guests' },
  { label: 'Plan the surprise moment', done: false, category: 'Surprise' },
  { label: 'Write a heartfelt card', done: false, category: 'Personal' },
];

export function createDefaultPlan(): BirthdayPlan {
  return {
    settings: {
      herName: 'My Love',
      birthdayDate: '',
      partyTheme: 'An evening she will never forget',
      venue: '',
    },
    gifts: [],
    checklist: DEFAULT_CHECKLIST.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    })),
    guests: [],
    menu: [],
    surprises: [],
    loveNotes: [],
    budget: [],
  };
}

export function mergePlan(stored: BirthdayPlan): BirthdayPlan {
  const defaults = createDefaultPlan();
  return {
    ...defaults,
    ...stored,
    settings: { ...defaults.settings, ...stored.settings },
  };
}
