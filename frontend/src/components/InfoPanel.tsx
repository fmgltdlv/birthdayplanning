interface InfoPanelProps {
  onClose: () => void;
}

export function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <section className="info-panel" aria-labelledby="info-panel-title">
      <div className="info-panel-head">
        <button type="button" className="btn-close-panel" onClick={onClose}>
          Close
        </button>
      </div>

      <header className="info-brand">
        <p className="eyebrow">Booty Bear</p>
        <h1 id="info-panel-title">Time Capsule</h1>
        <p className="info-lead">
          A shared sky of notes and photos — no login, just memories.
        </p>
      </header>

      <div className="info-instructions">
        <h2>How it works</h2>
        <ul>
          <li>
            <strong>Add</strong> — tap <span className="info-icon">+</span> to
            leave a note or photo with your name.
          </li>
          <li>
            <strong>Explore</strong> — tap a bubble to open it. Drag the sky to
            wander; scroll or pinch to zoom.
          </li>
          <li>
            <strong>Newest in the middle</strong> — the latest memories sit at
            the center; older ones drift toward the edges.
          </li>
          <li>
            <strong>Zoom levels</strong> — you start up close (~50 bubbles).
            Zoom out until many are on screen (~80+) to see the total count and a
            light overview (no photos loaded until you zoom back in).
          </li>
          <li>
            <strong>Search</strong> — tap <span className="info-icon">⌕</span>{' '}
            to filter, sort, and jump to a memory from a list.
          </li>
        </ul>
      </div>
    </section>
  );
}
