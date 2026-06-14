import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating = 0, size = 14, showValue = false, count = null }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={size} className="fill-accent text-accent" />;
          }
          if (i === fullStars && hasHalf) {
            return <StarHalf key={i} size={size} className="fill-accent text-accent" />;
          }
          return <Star key={i} size={size} className="text-slate-300 dark:text-slate-600" />;
        })}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {rating.toFixed(1)} {count !== null && `(${count})`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
