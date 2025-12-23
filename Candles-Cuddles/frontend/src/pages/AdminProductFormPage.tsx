import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightOnRectangleIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminGetProduct,
  adminLogout,
  getAdminToken,
} from '../api/admin';
import { requestPresignedUrl } from '../api/uploads';

export const AdminProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    currency: 'INR',
    images: [] as string[],
    stock: '0',
    active: true,
    category: '',
    tags: [] as string[],
  });
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin/login');
      return;
    }

    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit, navigate]);

  const loadProduct = async (productId: string) => {
    try {
      const product = await adminGetProduct(productId);
      setFormData({
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price.toString(),
        currency: product.currency || 'INR',
        images: product.images || [],
        stock: product.stock?.toString() || '0',
        active: product.active !== false,
        category: product.category || '',
        tags: product.tags || [],
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load product');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        price: parseInt(formData.price),
        currency: formData.currency,
        images: formData.images,
        stock: parseInt(formData.stock) || 0,
        active: formData.active,
        category: formData.category || undefined,
        tags: formData.tags,
      };

      if (isEdit && id) {
        await adminUpdateProduct(id, payload);
      } else {
        await adminCreateProduct(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB');
      }

      // Get presigned URL
      const presign = await requestPresignedUrl(file.type);
      console.log('Presigned URL received:', presign);
      
      // Upload to S3
      console.log('Uploading to S3:', presign.uploadUrl.substring(0, 100) + '...');
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': file.type,
        },
        body: file,
      });

      console.log('Upload response status:', uploadResponse.status, uploadResponse.statusText);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => 'Unknown error');
        console.error('Upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
          url: presign.uploadUrl.substring(0, 100),
        });
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}. ${errorText.substring(0, 200)}`);
      }

      console.log('✅ Image uploaded successfully:', presign.publicUrl);
      
      // Upload succeeded! Add to images array immediately
      // Note: Verification may fail due to CORS, but upload is complete
      if (!formData.images.includes(presign.publicUrl)) {
        setFormData({ ...formData, images: [...formData.images, presign.publicUrl] });
      }
      
      // Try to verify (but don't fail if CORS blocks it)
      try {
        // Wait a moment for S3 to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify the image is accessible (may fail due to CORS, that's OK)
        await fetch(presign.publicUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Don't fail on CORS errors
        });
        console.log('✅ Image verification attempted (CORS may block, but upload succeeded)');
      } catch (verifyError) {
        // CORS error is expected - upload still succeeded
        console.log('ℹ️ Verification blocked by CORS (upload succeeded, image should be accessible)');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData({ ...formData, images: [...formData.images, imageUrl.trim()] });
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  if (loadingProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light/10 to-white">
      {/* Header */}
      <header className="border-b border-brand/10 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="rounded-full p-2 text-brand-dark transition hover:bg-brand-light/20"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-display text-2xl text-brand-dark">
                  {isEdit ? 'Edit Product' : 'Add New Product'}
                </h1>
              </div>
            </div>
            <button
              onClick={() => {
                adminLogout();
                navigate('/admin/login');
              }}
              className="flex items-center gap-2 rounded-full border border-brand/20 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-brand/15 bg-white p-8 shadow-sm">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="e.g., Lavender Scented Candle"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Slug (URL-friendly)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="auto-generated from title"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="e.g., Candles, Gifts"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Price (INR) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="999"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                rows={4}
                placeholder="Describe your product..."
                required
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
              Product Images
            </label>
            
            {/* File Upload */}
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/30 bg-brand-light/10 px-4 py-6 transition hover:border-brand hover:bg-brand-light/20 ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PhotoIcon className="h-6 w-6 text-brand" />
                <span className="text-sm font-semibold text-brand-dark">
                  {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                </span>
              </label>
              <p className="mt-1 text-xs text-brand-dark/60">Or paste an image URL below</p>
            </div>

            {/* URL Input */}
            <div className="mt-3 flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <button
                type="button"
                onClick={addImage}
                disabled={!imageUrl.trim()}
                className="rounded-xl border border-brand/20 bg-brand-light/20 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand-light/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add URL
              </button>
            </div>

            {/* Image Preview Grid */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-light/10">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        console.error('Image failed to load:', url);
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        // Show error message
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-red-50 text-xs text-red-600 p-2';
                        errorDiv.textContent = 'Failed to load';
                        img.parentElement?.appendChild(errorDiv);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', url);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
              Tags
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="e.g., lavender, relaxing"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl border border-brand/20 bg-brand-light/20 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand-light/30"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-light/20 px-3 py-1 text-sm text-brand-dark"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-brand-dark/70 hover:text-brand-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-5 w-5 rounded border-brand/20 text-brand focus:ring-brand/20"
            />
            <label htmlFor="active" className="text-sm font-semibold text-brand-dark">
              Product is active (visible in store)
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="rounded-full border border-brand/20 px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

