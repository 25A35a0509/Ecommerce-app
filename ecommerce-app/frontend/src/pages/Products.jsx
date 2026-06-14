import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';
import Pagination from '../components/Pagination';

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'ratings.average-desc', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);
  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });
  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedPrice = useDebounce(priceRange, 500);

  // Sync debounced search into URL params
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (debouncedPrice.min !== minPrice || debouncedPrice.max !== maxPrice) {
      updateParams({ minPrice: debouncedPrice.min, maxPrice: debouncedPrice.max, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrice]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  useEffect(() => {
    productService
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      featured: featured || undefined,
      sortBy,
      order,
      page,
      limit: 12,
    }),
    [search, category, minPrice, maxPrice, featured, sortBy, order, page]
  );

  useEffect(() => {
    setLoading(true);
    productService
      .getProducts(queryParams)
      .then((data) => {
        setProducts(data.products);
        setPagination({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [queryParams]);

  const handleSortChange = (value) => {
    const [field, dir] = value.split('-');
    // handle "ratings.average-desc" correctly
    if (value.startsWith('ratings.average')) {
      updateParams({ sortBy: 'ratings.average', order: 'desc', page: 1 });
    } else {
      updateParams({ sortBy: field, order: dir, page: 1 });
    }
  };

  const currentSortValue =
    sortBy === 'ratings.average' ? 'ratings.average-desc' : `${sortBy}-${order}`;

  const clearFilters = () => {
    setSearchInput('');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || featured;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {category || (featured === 'true' ? 'Featured Products' : 'All Products')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentSortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field w-auto"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`btn-secondary lg:hidden ${showFilters ? 'border-primary text-primary' : ''}`}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters sidebar */}
        <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card sticky top-20 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Filter size={16} /> Filters
              </h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">Search</label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-text">Category</label>
                <select
                  value={category}
                  onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                    className="input-field"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={featured === 'true'}
                  onChange={(e) => updateParams({ featured: e.target.checked ? 'true' : '', page: 1 })}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                Featured products only
              </label>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your filters or search terms.
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-primary mt-4">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onPageChange={(p) => updateParams({ page: p })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
