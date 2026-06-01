import { useRef, useState } from 'react';
import { postNote, postPhoto } from '../api/capsuleApi';
import type { CapsuleEntry } from '../types';
import { compressImageForUpload, formatBytes } from '../utils/compressImage';

const MAX_PHOTOS = 10;

interface UploadPanelProps {
  authorName: string;
  onPosted: (entry: CapsuleEntry) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface PendingPhoto {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
}

export function UploadPanel({
  authorName,
  onPosted,
  collapsed = false,
  onToggle,
}: UploadPanelProps) {
  const [mode, setMode] = useState<'note' | 'photo'>('note');
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

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
    setProgress('Compressing on your device…');

    try {
      const next: PendingPhoto[] = [];
      for (const raw of picked) {
        const compressed = await compressImageForUpload(raw);
        next.push({
          id: crypto.randomUUID(),
          file: compressed,
          preview: URL.createObjectURL(compressed),
          originalSize: raw.size,
          compressedSize: compressed.size,
        });
      }
      setPending((prev) => [...prev, ...next].slice(0, MAX_PHOTOS));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process photos');
    } finally {
      setBusy(false);
      setProgress('');
      if (galleryRef.current) galleryRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
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

    const uploaded: CapsuleEntry[] = [];
    try {
      for (let i = 0; i < pending.length; i++) {
        setProgress(`Uploading ${i + 1} of ${pending.length}…`);
        const item = pending[i];
        const entry = await postPhoto(
          item.file,
          authorName,
          i === 0 ? caption : '',
        );
        uploaded.push(entry);
        onPosted(entry);
      }
      setCaption('');
      clearPending();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      uploaded.forEach(onPosted);
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  if (collapsed) {
    return (
      <button type="button" className="fab-add" onClick={onToggle} aria-label="Add to capsule">
        +
      </button>
    );
  }

  return (
    <section className="upload-panel">
      <div className="upload-panel-head">
        <h2>Add to the capsule</h2>
        {onToggle && (
          <button type="button" className="btn-close-panel" onClick={onToggle}>
            Close
          </button>
        )}
      </div>

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
            Up to {MAX_PHOTOS} photos · compressed on your phone to ≤5 MB each
          </p>
          <div className="photo-actions">
            <label className="photo-action-btn">
              <input
                ref={galleryRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                hidden
                onChange={(e) => void addFiles(e.target.files)}
              />
              Gallery ({pending.length}/{MAX_PHOTOS})
            </label>
            <label className="photo-action-btn camera">
              <input
                ref={cameraRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                hidden
                onChange={(e) => void addFiles(e.target.files)}
              />
              Camera
            </label>
          </div>

          {pending.length > 0 && (
            <ul className="pending-grid">
              {pending.map((p) => (
                <li key={p.id} className="pending-thumb">
                  <img src={p.preview} alt="" />
                  <span className="pending-size">
                    {formatBytes(p.originalSize)} → {formatBytes(p.compressedSize)}
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
  );
}
