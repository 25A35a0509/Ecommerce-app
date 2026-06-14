import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Star } from 'lucide-react';
import { productService } from '../../services/productService';
import { getImageUrl } from '../../services/api';
import { formatPrice, getEffectivePrice } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import { TableRowSkeleton } from '../../components/Skeletons';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import ProductFormModal from './ProductFormModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        search: debouncedSearch || undefined,
        page,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      });
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created successfully');
      }
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(deleteTarget._id);
      toast.success('Product deleted');
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleDeleteImage = async (productId, imageIndex) => {
    try {
      const data = await productService.deleteProductImage(productId, imageIndex);
      setEditingProduct(data.product);
      await fetchProducts();
      toast.success('Image removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove image');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-left text-xs font-semibold uppercase text-slate-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(product.images?.[0]?.url)}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-medium text-slate-900 dark:text-white">
                            {product.name}
                            {product.isFeatured && <Star size={12} className="fill-accent text-accent" />}
                          </p>
                          <p className="text-xs text-slate-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{product.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatPrice(getEffectivePrice(product))}
                      </span>
                      {product.discountPrice && (
                        <span className="ml-1 text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.stock === 0 ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : product.stock < 10 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      ⭐ {product.ratings?.average?.toFixed(1) || '0.0'} ({product.ratings?.count || 0})
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setModalOpen(true);
                          }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        product={editingProduct}
        onDeleteImage={handleDeleteImage}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminProducts;
