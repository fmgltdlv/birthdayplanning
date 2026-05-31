import { useCallback, useEffect, useRef, useState } from 'react';
import type { BirthdayPlan } from '../types';
import {
  DEFAULT_CHECKLIST,
  DEFAULT_SETTINGS,
} from '../types';
import {
  clearCredentials,
  createCloudPlan,
  fetchCloudPlan,
  getStoredCredentials,
  saveCloudPlan,
  storeCredentials,
  type PlanCredentials,
} from '../api/planApi';

const STORAGE_KEY = 'birthday-plan-for-her';
const SAVE_DEBOUNCE_MS = 600;

export type SyncStatus = 'local' | 'loading' | 'synced' | 'saving' | 'error';

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

function loadLocalPlan(): BirthdayPlan {
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
  const [plan, setPlan] = useState<BirthdayPlan>(loadLocalPlan);
  const [credentials, setCredentials] = useState<PlanCredentials | null>(
    getStoredCredentials,
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    getStoredCredentials() ? 'loading' : 'local',
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    const creds = getStoredCredentials();
    if (!creds) return;

    let cancelled = false;
    fetchCloudPlan(creds)
      .then(({ plan: cloudPlan }) => {
        if (cancelled) return;
        skipNextSave.current = true;
        setPlan(cloudPlan);
        setSyncStatus('synced');
        setSyncError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setSyncError(e instanceof Error ? e.message : 'Could not load from cloud');
        setSyncStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scheduleCloudSave = useCallback(
    (nextPlan: BirthdayPlan, creds: PlanCredentials) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSyncStatus('saving');
        saveCloudPlan(creds, nextPlan)
          .then(() => {
            setSyncStatus('synced');
            setSyncError(null);
          })
          .catch((e) => {
            setSyncError(e instanceof Error ? e.message : 'Save failed');
            setSyncStatus('error');
          });
      }, SAVE_DEBOUNCE_MS);
    },
    [],
  );

  const updatePlan = useCallback(
    (updater: (prev: BirthdayPlan) => BirthdayPlan) => {
      setPlan((prev) => {
        const next = updater(prev);
        const creds = credentials ?? getStoredCredentials();
        if (creds && !skipNextSave.current) {
          scheduleCloudSave(next, creds);
        }
        skipNextSave.current = false;
        return next;
      });
    },
    [credentials, scheduleCloudSave],
  );

  const enableCloudSync = useCallback(async (currentPlan?: BirthdayPlan) => {
    setSyncStatus('loading');
    setSyncError(null);
    try {
      const toUpload = currentPlan ?? loadLocalPlan();
      const { credentials: creds, plan: cloudPlan } = await createCloudPlan(toUpload);
      setCredentials(creds);
      skipNextSave.current = true;
      setPlan(cloudPlan);
      setSyncStatus('synced');
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Could not enable cloud sync');
      setSyncStatus('error');
    }
  }, []);

  const linkExistingPlan = useCallback(
    async (id: string, secret: string) => {
      const creds = { id: id.trim(), secret: secret.trim() };
      storeCredentials(creds);
      setCredentials(creds);
      setSyncStatus('loading');
      setSyncError(null);
      try {
        const { plan: cloudPlan } = await fetchCloudPlan(creds);
        skipNextSave.current = true;
        setPlan(cloudPlan);
        setSyncStatus('synced');
      } catch (e) {
        clearCredentials();
        setCredentials(null);
        setSyncError(e instanceof Error ? e.message : 'Invalid plan ID or secret');
        setSyncStatus('error');
      }
    },
    [],
  );

  const disconnectCloud = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    clearCredentials();
    setCredentials(null);
    setSyncStatus('local');
    setSyncError(null);
  }, []);

  const resetPlan = useCallback(() => {
    if (window.confirm('Reset all planning data? This cannot be undone.')) {
      const fresh = createDefaultPlan();
      skipNextSave.current = false;
      setPlan(fresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      const creds = credentials ?? getStoredCredentials();
      if (creds) scheduleCloudSave(fresh, creds);
    }
  }, [credentials, scheduleCloudSave]);

  return {
    plan,
    updatePlan,
    resetPlan,
    credentials,
    syncStatus,
    syncError,
    enableCloudSync,
    linkExistingPlan,
    disconnectCloud,
  };
}
