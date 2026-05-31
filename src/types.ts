export type GiftStatus = 'idea' | 'ordered' | 'wrapped' | 'given';

export interface Gift {
  id: string;
  name: string;
  notes: string;
  estimatedCost: number;
  status: GiftStatus;
  link: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  rsvp: 'pending' | 'yes' | 'no' | 'maybe';
  dietary: string;
  plusOne: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'appetizer' | 'main' | 'dessert' | 'drink' | 'cake';
  notes: string;
}

export interface SurpriseEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  secret: boolean;
}

export interface LoveNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface BudgetEntry {
  id: string;
  label: string;
  amount: number;
  category: string;
}

export interface AppSettings {
  herName: string;
  birthdayDate: string;
  partyTheme: string;
  venue: string;
}

export interface BirthdayPlan {
  settings: AppSettings;
  gifts: Gift[];
  checklist: ChecklistItem[];
  guests: Guest[];
  menu: MenuItem[];
  surprises: SurpriseEvent[];
  loveNotes: LoveNote[];
  budget: BudgetEntry[];
}

export const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
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

export const DEFAULT_SETTINGS: AppSettings = {
  herName: 'My Love',
  birthdayDate: '',
  partyTheme: 'An evening she will never forget',
  venue: '',
};
