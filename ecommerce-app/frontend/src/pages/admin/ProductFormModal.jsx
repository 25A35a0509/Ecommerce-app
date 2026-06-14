import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Save, PlusCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { getImageUrl } from '../../services/api';

const categoryOptions = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Toys',
  'Beauty',
  'Sports',
  'Grocery',
  'Other',
];

const ProductFormModal = ({ isOpen, onClose, onSubmit, product, onDeleteImage }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || '',
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        isFeatured: product.isFeatured,
      });
    } else {
      reset({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: 'Electronics',
        brand: '',
        stock: '',
        isFeatured: false,
      });
    }
    setImageFiles([]);
    setImagePreviews([]);
  }, [product, reset, isOpen]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const submitHandler = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'isFeatured') {
        formData.append(key, value ? 'true' : 'false');
      } else if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    imageFiles.forEach((file) => formData.append('images', file));

    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div>
          <label className="label-text">Product Name</label>
          <input className="input-field" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label-text">Description</label>
          <textarea rows={3} className="input-field resize-none" {...register('description', { required: 'Description is required' })} />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Price ($)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be positive' } })}
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div>
            <label className="label-text">Discount Price ($) — optional</label>
            <input type="number" step="0.01" className="input-field" {...register('discountPrice')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Category</label>
            <select className="input-field" {...register('category', { required: true })}>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Brand</label>
            <input className="input-field" placeholder="Generic" {...register('brand')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Stock Quantity</label>
            <input
              type="number"
              className="input-field"
              {...register('stock', { required: 'Stock is required', min: { value: 0, message: 'Must be non-negative' } })}
            />
            {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" {...register('isFeatured')} />
              Featured Product
            </label>
          </div>
        </div>

        {/* Existing images */}
        {product?.images?.length > 0 && (
          <div>
            <label className="label-text">Current Images</label>
            <div className="flex flex-wrap gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 dark:border-dark-border">
                  <img src={getImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onDeleteImage(product._id, i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New images upload */}
        <div>
          <label className="label-text">{product ? 'Add More Images' : 'Product Images'} (max 5)</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-dark-border p-4 text-sm text-slate-500 transition-colors hover:border-primary hover:text-primary">
            <Upload size={18} />
            {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Click to upload images'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </label>
          {imagePreviews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imagePreviews.map((src, i) => (
                <img key={i} src={src} alt="" className="h-16 w-16 rounded-xl object-cover" />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : product ? (
              <>
                <Save size={16} /> Save Changes
              </>
            ) : (
              <>
                <PlusCircle size={16} /> Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
