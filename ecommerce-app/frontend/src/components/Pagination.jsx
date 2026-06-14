import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(pages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        className="btn-secondary px-3 disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && <span className="px-1 text-slate-400">…</span>}

      {pageNumbers.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`h-9 w-9 rounded-xl text-sm font-semibold transition-colors ${
            p === page
              ? 'bg-primary text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          {p}
        </button>
      ))}

      {end < pages && <span className="px-1 text-slate-400">…</span>}

      <button
        onClick={() => onPageChange(Math.min(page + 1, pages))}
        disabled={page === pages}
        className="btn-secondary px-3 disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
