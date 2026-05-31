import type { LoveNote } from '../types';

interface LoveNotesPanelProps {
  notes: LoveNote[];
  onChange: (notes: LoveNote[]) => void;
}

export function LoveNotesPanel({ notes, onChange }: LoveNotesPanelProps) {
  const addNote = () => {
    onChange([
      ...notes,
      {
        id: crypto.randomUUID(),
        text: '',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const update = (id: string, text: string) => {
    onChange(notes.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const remove = (id: string) => {
    onChange(notes.filter((n) => n.id !== id));
  };

  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
      <div className="panel-toolbar">
        <button type="button" className="btn btn-primary" onClick={addNote}>
          + Add note
        </button>
        <span className="muted">Ideas for her card, toast, or a letter</span>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-state">
          Capture the words you want her to hear on her birthday.
        </p>
      ) : (
        <ul className="notes-list">
          {sorted.map((note) => (
            <li key={note.id} className="note-card">
              <textarea
                value={note.text}
                onChange={(e) => update(note.id, e.target.value)}
                placeholder="What makes her extraordinary, a memory, a promise..."
                rows={4}
              />
              <footer className="note-footer">
                <time dateTime={note.createdAt}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </time>
                <button
                  type="button"
                  className="btn btn-ghost btn-danger-text"
                  onClick={() => remove(note.id)}
                >
                  Remove
                </button>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
