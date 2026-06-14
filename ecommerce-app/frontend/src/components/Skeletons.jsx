export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton aspect-square w-full rounded-none" />
    <div className="space-y-2 p-4">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-3 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <div className="skeleton h-5 w-16" />
        <div className="skeleton h-9 w-9 rounded-xl" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const StatCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-center justify-between">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-9 w-9 rounded-xl" />
    </div>
    <div className="skeleton h-8 w-16" />
  </div>
);
