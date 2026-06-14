import { useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import StarRating from './StarRating';
import { getInitials, formatDate } from '../utils/helpers';
import { useAppSelector } from '../hooks/useRedux';

export const ReviewItem = ({ review, onEdit, onDelete }) => {
  const { user } = useAppSelector((state) => state.auth);
  const isOwner = user?._id === review.user?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="border-b border-slate-100 dark:border-dark-border py-4 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-xs font-bold text-white">
            {getInitials(review.user?.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {review.user?.name || 'Anonymous'}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRating rating={review.rating} size={12} />
              <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {(isOwner || isAdmin) && (
          <div className="flex items-center gap-1">
            {isOwner && (
              <button
                onClick={() => onEdit(review)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
              >
                <Edit2 size={14} />
              </button>
            )}
            <button
              onClick={() => onDelete(review)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
    </div>
  );
};

export const ReviewForm = ({ onSubmit, initialData, onCancel }) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      setComment('');
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4">
      <div>
        <label className="label-text">Your Rating</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className={`text-2xl transition-colors ${
                i < rating ? 'text-accent' : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-text">Your Review</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          className="input-field resize-none"
          maxLength={1000}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Submitting...' : initialData ? 'Update Review' : 'Submit Review'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
