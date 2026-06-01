import { useEffect, useRef, useState } from 'react';
import { postNote, postPhoto } from '../api/capsuleApi';
import type { CapsuleEntry } from '../types';
import { formatBytes, isLikelyImage, preparePhotoUpload } from '../utils/compressImage';

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
  const [photoSourceOpen, setPhotoSourceOpen] = useState(false);
  const libraryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(AUTHOR_KEY, authorName);
  }, [authorName]);

  const hasName = authorName.trim().length > 0;

  const clearPending = () => {
    pending.forEach((p) => URL.revokeObjectURL(p.preview));
    setPending([]);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setPhotoSourceOpen(false);

    const slots = MAX_PHOTOS - pending.length;
    if (slots <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos at a time`);
      return;
    }

    const picked = Array.from(files).filter(isLikelyImage).slice(0, slots);
    if (picked.length === 0) {
      setError('No valid photos selected');
      return;
    }
    if (files.length > slots) {
      setError(`Only ${MAX_PHOTOS} photos allowed — added first ${slots}`);
    }

    setBusy(true);
    setProgress('Processing…');

    const errors: string[] = [];
    const next: PendingPhoto[] = [];

    for (const raw of picked) {
      try {
        const { full, thumb } = await preparePhotoUpload(raw);
        next.push({
          id: crypto.randomUUID(),
          full,
          thumb,
          preview: URL.createObjectURL(thumb),
          fullSize: full.size,
          thumbSize: thumb.size,
        });
      } catch (e) {
        errors.push(e instanceof Error ? e.message : 'Could not process a photo');
      }
    }

    if (next.length) {
      setPending((prev) => [...prev, ...next].slice(0, MAX_PHOTOS));
    }
    if (errors.length) {
      setError(errors[0]);
    }

    setBusy(false);
    setProgress('');
    if (libraryRef.current) libraryRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const removePending = (id: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const submitNote = async () => {
    if (!hasName) {
      setError('Please enter your name');
      return;
    }
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
    if (!hasName) {
      setError('Please enter your name');
      return;
    }
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
          <span>Your name</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Who is leaving this?"
            autoComplete="name"
            required
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
              disabled={busy || !text.trim() || !hasName}
              onClick={() => void submitNote()}
            >
              {busy ? 'Saving…' : 'Seal the note'}
            </button>
          </>
        ) : (
          <>
            <p className="upload-hint">
              Up to {MAX_PHOTOS} photos
            </p>

            <input
              ref={libraryRef}
              type="file"
              className="photo-input-hidden"
              accept="image/*"
              multiple
              onChange={(e) => void addFiles(e.target.files)}
            />
            <input
              ref={cameraRef}
              type="file"
              className="photo-input-hidden"
              accept="image/*"
              capture="environment"
              onChange={(e) => void addFiles(e.target.files)}
            />

            <button
              type="button"
              className="photo-pick-btn"
              disabled={busy || pending.length >= MAX_PHOTOS}
              onClick={() => setPhotoSourceOpen(true)}
            >
              Add photos ({pending.length}/{MAX_PHOTOS})
            </button>

            {photoSourceOpen && (
              <div className="photo-source-sheet" role="dialog" aria-label="Photo source">
                <p className="photo-source-title">Add photos from</p>
                <button
                  type="button"
                  className="photo-source-option"
                  onClick={() => libraryRef.current?.click()}
                >
                  Photo library
                  <span className="photo-source-sub">Choose one or more</span>
                </button>
                <button
                  type="button"
                  className="photo-source-option"
                  onClick={() => cameraRef.current?.click()}
                >
                  Camera
                  <span className="photo-source-sub">Take a photo now</span>
                </button>
                <button
                  type="button"
                  className="photo-source-cancel"
                  onClick={() => setPhotoSourceOpen(false)}
                >
                  Cancel
                </button>
              </div>
            )}

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
              disabled={busy || pending.length === 0 || !hasName}
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
