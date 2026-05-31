import { useCallback, useEffect, useState } from 'react';
import type { BirthdayPlan } from '../types';
import {
  DEFAULT_CHECKLIST,
  DEFAULT_SETTINGS,
} from '../types';

const STORAGE_KEY = 'birthday-plan-for-her';

function uid(): string {
  return crypto.randomUUID();
}

function createDefaultPlan(): BirthdayPlan {
  return {
    settings: { ...DEFAULT_SETTINGS },
    gifts: [],
    checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item, id: uid() })),
    guests: [],
    menu: [],
    surprises: [],
    loveNotes: [],
    budget: [],
  };
}

function loadPlan(): BirthdayPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPlan();
    const parsed = JSON.parse(raw) as BirthdayPlan;
    return {
      ...createDefaultPlan(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return createDefaultPlan();
  }
}

export function useBirthdayStore() {
  const [plan, setPlan] = useState<BirthdayPlan>(loadPlan);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  const updatePlan = useCallback((updater: (prev: BirthdayPlan) => BirthdayPlan) => {
    setPlan((prev) => updater(prev));
  }, []);

  const resetPlan = useCallback(() => {
    if (window.confirm('Reset all planning data? This cannot be undone.')) {
      const fresh = createDefaultPlan();
      setPlan(fresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    }
  }, []);

  return { plan, updatePlan, resetPlan };
}
