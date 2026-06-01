import { useEffect, useRef, useState } from 'react';
import { postNote, postPhoto } from '../api/capsuleApi';
import type { CapsuleEntry } from '../types';
import { formatBytes, preparePhotoUpload } from '../utils/compressImage';

const MAX_PHOTOS = 10;
const AUTHOR_KEY = 'capsule-author-name';

function loadAuthor(): string {
  return localStorage.getItem(AUTHOR_KEY) ?? '';
}

interface UploadPanelProps {
  onPosted: (entry: CapsuleEntry) => void;
  open: boolean;
  onClose: () => void;
}

interface PendingPhoto {
  id: string;
  full: File;
  thumb: File;
  preview: string;
  fullSize: number;
  thumbSize: number;
}

export function UploadPanel({ onPosted, open, onClose }: UploadPanelProps) {
  const [authorName, setAuthorName] = useState(loadAuthor);
  const [mode, setMode] = useState<'note' | 'photo'>('note');
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(AUTHOR_KEY, authorName);
  }, [authorName]);

  const clearPending = () => {
    pending.forEach((p) => URL.revokeObjectURL(p.preview));
    setPending([]);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);

    const slots = MAX_PHOTOS - pending.length;
    if (slots <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos at a time`);
      return;
    }

    const picked = Array.from(files).slice(0, slots);
    if (files.length > slots) {
      setError(`Only ${MAX_PHOTOS} photos allowed — added first ${slots}`);
    }

    setBusy(true);
    setProgress('Preparing photos on your device…');

    try {
      const next: PendingPhoto[] = [];
      for (const raw of picked) {
        const { full, thumb } = await preparePhotoUpload(raw);
        next.push({
          id: crypto.randomUUID(),
          full,
          thumb,
          preview: URL.createObjectURL(thumb),
          fullSize: full.size,
          thumbSize: thumb.size,
        });
      }
      setPending((prev) => [...prev, ...next].slice(0, MAX_PHOTOS));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process photos');
    } finally {
      setBusy(false);
      setProgress('');
      if (photoRef.current) photoRef.current.value = '';
    }
  };

  const removePending = (id: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const submitNote = async () => {
    setError(null);
    setBusy(true);
    try {
      const entry = await postNote(text, authorName);
      setText('');
      onPosted(entry);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const submitPhotos = async () => {
    if (pending.length === 0) {
      setError('Add at least one photo');
      return;
    }
    setError(null);
    setBusy(true);

    try {
      for (let i = 0; i < pending.length; i++) {
        setProgress(`Uploading ${i + 1} of ${pending.length}…`);
        const item = pending[i];
        const entry = await postPhoto(
          item.full,
          item.thumb,
          authorName,
          i === 0 ? caption : '',
        );
        onPosted(entry);
      }
      setCaption('');
      clearPending();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="upload-scrim" onClick={onClose} role="presentation" />
      <section className="upload-panel">
        <div className="upload-panel-head">
          <h2>Add to the capsule</h2>
          <button type="button" className="btn-close-panel" onClick={onClose}>
            Close
          </button>
        </div>

        <label className="author-field">
          <span>Your name (optional)</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Who is leaving this?"
            autoComplete="name"
          />
        </label>

        <div className="mode-tabs">
          <button
            type="button"
            className={mode === 'note' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setMode('note')}
          >
            Note
          </button>
          <button
            type="button"
            className={mode === 'photo' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setMode('photo')}
          >
            Photos
          </button>
        </div>

        {mode === 'note' ? (
          <>
            <textarea
              className="upload-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write something for the capsule…"
              rows={4}
            />
            <button
              type="button"
              className="btn-submit"
              disabled={busy || !text.trim()}
              onClick={() => void submitNote()}
            >
              {busy ? 'Saving…' : 'Seal the note'}
            </button>
          </>
        ) : (
          <>
            <p className="upload-hint">
              Up to {MAX_PHOTOS} photos · full ≤5 MB + thumbnail on your device
            </p>
            <label className="photo-pick-btn">
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => void addFiles(e.target.files)}
              />
              Choose photos ({pending.length}/{MAX_PHOTOS})
            </label>

            {pending.length > 0 && (
              <ul className="pending-grid">
                {pending.map((p) => (
                  <li key={p.id} className="pending-thumb">
                    <img src={p.preview} alt="" />
                    <span className="pending-size">
                      {formatBytes(p.fullSize)} · thumb {formatBytes(p.thumbSize)}
                    </span>
                    <button
                      type="button"
                      className="pending-remove"
                      onClick={() => removePending(p.id)}
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <input
              type="text"
              className="caption-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption for batch (optional)"
            />

            <button
              type="button"
              className="btn-submit"
              disabled={busy || pending.length === 0}
              onClick={() => void submitPhotos()}
            >
              {busy ? progress || 'Uploading…' : `Add ${pending.length || ''} photo${pending.length === 1 ? '' : 's'}`}
            </button>
          </>
        )}

        {error && <p className="form-error">{error}</p>}
      </section>
    </>
  );
}
