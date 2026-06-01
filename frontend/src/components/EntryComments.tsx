import { useEffect, useState } from 'react';
import { fetchComments, postComment } from '../api/capsuleApi';
import { loadAuthorName, saveAuthorName, trimAuthorName } from '../authorStorage';
import type { CapsuleComment } from '../types';

interface EntryCommentsProps {
  entryId: string;
}

function formatCommentWhen(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function EntryComments({ entryId }: EntryCommentsProps) {
  const [comments, setComments] = useState<CapsuleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState(loadAuthorName);
  const [commentText, setCommentText] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    saveAuthorName(authorName);
  }, [authorName]);

  useEffect(() => {
    let cancelled = false;

    void fetchComments(entryId)
      .then((loaded) => {
        if (!cancelled) {
          setComments(loaded);
          setLoadError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load comments');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entryId]);

  const hasAuthor = trimAuthorName(authorName).length > 0;
  const hasText = commentText.trim().length > 0;
  const canSubmit = hasAuthor && hasText && !busy;

  const submitComment = async () => {
    if (!hasAuthor) {
      setFormError('Your name is required');
      return;
    }
    if (!hasText) {
      setFormError('Write a comment first');
      return;
    }

    setFormError(null);
    setBusy(true);
    try {
      const comment = await postComment(entryId, commentText, authorName);
      setComments((prev) => [...prev, comment]);
      setCommentText('');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not post comment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="modal-comments" aria-label="Comments">
      <h3 className="modal-comments-heading">Comments</h3>

      {loading && <p className="modal-comments-muted">Loading comments…</p>}
      {loadError && <p className="form-error">{loadError}</p>}

      {!loading && !loadError && comments.length === 0 && (
        <p className="modal-comments-muted">No comments yet — be the first.</p>
      )}

      {comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-item">
              <p className="comment-meta">
                <strong>{c.authorName}</strong>
                <time dateTime={new Date(c.createdAt * 1000).toISOString()}>
                  {formatCommentWhen(c.createdAt)}
                </time>
              </p>
              <p className="comment-body">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        className="comment-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submitComment();
        }}
      >
        <label className="author-field comment-author-field">
          <span>
            Your name <span className="field-required">(required)</span>
          </span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Who is commenting?"
            autoComplete="name"
            required
            aria-required="true"
          />
        </label>
        <label className="comment-text-field">
          <span>Comment</span>
          <textarea
            className="comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Leave a comment…"
            rows={3}
            required
            aria-required="true"
            disabled={!hasAuthor}
          />
        </label>
        <button type="submit" className="btn-submit comment-submit" disabled={!canSubmit}>
          {busy ? 'Posting…' : 'Post comment'}
        </button>
        {formError && <p className="form-error">{formError}</p>}
      </form>
    </section>
  );
}
