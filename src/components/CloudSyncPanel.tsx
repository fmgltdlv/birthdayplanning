import { useState } from 'react';
import type { BirthdayPlan } from '../types';
import type { PlanCredentials } from '../api/planApi';
import type { SyncStatus } from '../hooks/useBirthdayStore';

interface CloudSyncPanelProps {
  plan: BirthdayPlan;
  credentials: PlanCredentials | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  onEnable: (plan: BirthdayPlan) => Promise<void>;
  onLink: (id: string, secret: string) => Promise<void>;
  onDisconnect: () => void;
}

const STATUS_LABEL: Record<SyncStatus, string> = {
  local: 'Saved on this device only',
  loading: 'Connecting to cloud…',
  synced: 'Synced with Cloudflare D1',
  saving: 'Saving…',
  error: 'Sync error',
};

export function CloudSyncPanel({
  plan,
  credentials,
  syncStatus,
  syncError,
  onEnable,
  onLink,
  onDisconnect,
}: CloudSyncPanelProps) {
  const [linkId, setLinkId] = useState('');
  const [linkSecret, setLinkSecret] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCredentials = async () => {
    if (!credentials) return;
    const text = `Plan ID: ${credentials.id}\nSecret: ${credentials.secret}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cloud-sync">
      <h3 className="cloud-sync-title">Cloud backup (D1)</h3>
      <p className="cloud-sync-desc">
        Store your plan in Cloudflare D1 so you can access it from any device.
        Keep your plan ID and secret private — they are the only keys to your data.
      </p>

      <p className={`sync-badge sync-${syncStatus}`}>{STATUS_LABEL[syncStatus]}</p>
      {syncError && <p className="sync-error">{syncError}</p>}

      {credentials ? (
        <div className="cloud-credentials">
          <label className="field field-full">
            <span>Plan ID</span>
            <input type="text" readOnly value={credentials.id} />
          </label>
          <label className="field field-full">
            <span>Secret (do not share)</span>
            <input type="password" readOnly value={credentials.secret} />
          </label>
          <div className="panel-toolbar">
            <button type="button" className="btn btn-secondary" onClick={copyCredentials}>
              {copied ? 'Copied!' : 'Copy ID & secret'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onDisconnect}>
              Disconnect cloud
            </button>
          </div>
        </div>
      ) : (
        <div className="cloud-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void onEnable(plan)}
            disabled={syncStatus === 'loading'}
          >
            Enable cloud sync
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowLink((v) => !v)}
          >
            {showLink ? 'Cancel' : 'Link existing plan'}
          </button>
          {showLink && (
            <div className="link-form">
              <label className="field field-full">
                <span>Plan ID</span>
                <input
                  type="text"
                  value={linkId}
                  onChange={(e) => setLinkId(e.target.value)}
                  placeholder="From your other device"
                />
              </label>
              <label className="field field-full">
                <span>Secret</span>
                <input
                  type="password"
                  value={linkSecret}
                  onChange={(e) => setLinkSecret(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void onLink(linkId, linkSecret)}
                disabled={!linkId.trim() || !linkSecret.trim() || syncStatus === 'loading'}
              >
                Link plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
