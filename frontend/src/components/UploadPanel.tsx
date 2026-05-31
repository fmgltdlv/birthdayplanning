import { useRef, useState } from 'react';
import { postNote, postPhoto } from '../api/capsuleApi';
import type { CapsuleEntry } from '../types';

interface UploadPanelProps {
  authorName: string;
  onPosted: (entry: CapsuleEntry) => void;
}

export function UploadPanel({ authorName, onPosted }: UploadPanelProps) {
  const [mode, setMode] = useState<'note' | 'photo'>('note');
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onPickFile = (file: File | undefined) => {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'note') {
        const entry = await postNote(text, authorName);
        setText('');
        onPosted(entry);
      } else {
        const file = fileRef.current?.files?.[0];
        if (!file) {
          setError('Choose a photo first');
          return;
        }
        const entry = await postPhoto(file, authorName, caption);
        setCaption('');
        if (fileRef.current) fileRef.current.value = '';
        onPickFile(undefined);
        onPosted(entry);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="upload-panel">
      <div className="mode-tabs">
        <button
          type="button"
          className={mode === 'note' ? 'mode-tab active' : 'mode-tab'}
          onClick={() => setMode('note')}
        >
          Leave a note
        </button>
        <button
          type="button"
          className={mode === 'photo' ? 'mode-tab active' : 'mode-tab'}
          onClick={() => setMode('photo')}
        >
          Add a photo
        </button>
      </div>

      {mode === 'note' ? (
        <textarea
          className="upload-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something for the capsule…"
          rows={4}
        />
      ) : (
        <div className="photo-upload">
          <label className="file-label">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              capture="environment"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            <span>{preview ? 'Change photo' : 'Choose or take a photo'}</span>
          </label>
          {preview && (
            <img src={preview} alt="Preview" className="upload-preview" />
          )}
          <input
            type="text"
            className="caption-input"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
          />
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <button
        type="button"
        className="btn-submit"
        disabled={busy || (mode === 'note' && !text.trim())}
        onClick={() => void submit()}
      >
        {busy ? 'Saving…' : mode === 'note' ? 'Seal the note' : 'Add to capsule'}
      </button>
    </section>
  );
}
