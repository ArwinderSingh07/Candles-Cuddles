import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { adminGetProducts, adminDeleteProduct, adminLogout, getAdminToken } from '../api/admin';
import { formatINR } from '../lib/currency';
import type { Product } from '../types';

export const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    // Check if admin is logged in
    if (!getAdminToken()) {
      navigate('/admin/login');
      return;
    }
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      // Get all products (including inactive)
      const response = await adminGetProducts();
      setProducts(response);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeleting(id);
    try {
      await adminDeleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light/10 to-white">
      {/* Header */}
      <header className="border-b border-brand/10 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="rounded-full p-2 text-brand-dark transition hover:bg-brand-light/20"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-display text-2xl text-brand-dark">Manage Products</h1>
                <p className="text-sm text-brand-dark/70">Add, edit, or delete products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/products/new"
                className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-brand/20 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-brand/15 bg-white p-12 text-center shadow-sm">
            <CubeIcon className="mx-auto h-16 w-16 text-brand-dark/30" />
            <h3 className="mt-4 font-display text-xl text-brand-dark">No products yet</h3>
            <p className="mt-2 text-sm text-brand-dark/70">Get started by adding your first product</p>
            <Link
              to="/admin/products/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <PlusIcon className="h-5 w-5" />
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="group relative rounded-2xl border border-brand/15 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Product Image */}
                {product.images && product.images.length > 0 ? (
                  <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-brand-light/10">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        console.error('Product image failed to load:', product.images[0]);
                        const img = e.target as HTMLImageElement;
                        img.src = '/design/product-candle-1.png'; // Fallback image
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-brand-light/10 flex items-center justify-center">
                    <CubeIcon className="h-12 w-12 text-brand-dark/30" />
                  </div>
                )}

                {/* Product Info */}
                <h3 className="font-display text-lg text-brand-dark">{product.title}</h3>
                <p className="mt-1 text-sm text-brand-dark/70 line-clamp-2">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-brand-dark">{formatINR(product.price)}</span>
                  <span className="text-xs text-brand-dark/70">Stock: {product.stock}</span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/admin/products/${product._id}/edit`}
                    className="flex-1 rounded-full border border-brand/20 px-4 py-2 text-center text-sm font-semibold text-brand transition hover:bg-brand-light/20"
                  >
                    <PencilIcon className="mx-auto h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                    className="flex-1 rounded-full border border-red-200 px-4 py-2 text-center text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting === product._id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600"></span>
                    ) : (
                      <TrashIcon className="mx-auto h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

