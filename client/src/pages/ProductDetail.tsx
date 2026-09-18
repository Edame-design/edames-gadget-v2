import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Product } from '../lib/api';
import { asset } from '../lib/api';
import { addToCart } from '../lib/cart';

type ProductDetailProps = {
  product: Product;
  related: Product[];
};

export function ProductDetail({
  product,
  related,
}: ProductDetailProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState('Details');

  const price = Number(product.price || 0);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  }, [price]);

  const formattedTotal = useMemo(() => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price * qty);
  }, [price, qty]);

  const isOutOfStock =
    product.stock !== undefined && product.stock <= 0;

  const canDecrease = qty > 1;

  const canIncrease =
    product.stock === undefined ||
    qty < product.stock;

  /*
   * Keep quantity valid when the product changes.
   *
   * Example:
   * User is viewing Product A with 10 units,
   * then navigates to Product B with only 2 units.
   */
  useEffect(() => {
    setQty((current) => {
      if (product.stock === undefined) {
        return Math.max(1, current);
      }

      if (product.stock <= 0) {
        return 1;
      }

      return Math.min(
        Math.max(1, current),
        product.stock,
      );
    });

    setAdded(false);
  }, [product._id, product.stock]);

  /*
   * Automatically remove the "Added to cart" state
   * after a short period.
   */
  useEffect(() => {
    if (!added) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAdded(false);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [added]);

  const decreaseQty = () => {
    setQty((current) => Math.max(1, current - 1));
  };

  const increaseQty = () => {
    if (!canIncrease) {
      return;
    }

    setQty((current) => current + 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    addToCart(product, qty);

    window.dispatchEvent(
      new Event('cart:changed'),
    );

    setAdded(true);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="container-page py-5 md:py-8">
        {/* Back navigation */}
        <Link
          to="/shop"
          className="
            inline-flex
            items-center
            gap-1
            text-sm
            font-bold
            text-slate-500
            transition-colors
            hover:text-slate-950
          "
        >
          <ChevronLeft size={16} />
          Back to shop
        </Link>

        {/* Product overview */}
        <section
          className="
            mt-5
            grid
            overflow-hidden
            rounded-[32px]
            border
            border-slate-200
            bg-white
            md:grid-cols-2
          "
        >
          {/* Product image */}
          <div
            className="
              relative
              flex
              min-h-[420px]
              items-center
              justify-center
              bg-slate-50
              p-8
              md:min-h-[620px]
            "
          >
            {product.image ? (
              <img
                src={asset(product.image)}
                alt={product.name}
                className="
                  max-h-[520px]
                  w-full
                  object-contain
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  min-h-[320px]
                  w-full
                  items-center
                  justify-center
                  text-sm
                  font-medium
                  text-slate-400
                "
              >
                Product image unavailable
              </div>
            )}

            {/* Wishlist */}
            <button
              type="button"
              aria-label={`Add ${product.name} to wishlist`}
              className="
                absolute
                right-5
                top-5
                grid
                size-11
                place-items-center
                rounded-full
                bg-white
                text-slate-700
                shadow-sm
                transition-all
                hover:scale-105
                hover:text-red-500
                hover:shadow-md
              "
            >
              <Heart size={20} />
            </button>
          </div>

          {/* Product information */}
          <div className="p-6 md:p-12">
            {/* Category */}
            <p className="eyebrow">
              {product.category || 'Gadget'}
            </p>

            {/* Product name */}
            <h1
              className="
                mt-3
                text-3xl
                font-black
                tracking-tight
                text-slate-950
                md:text-5xl
              "
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="
                  flex
                  items-center
                  gap-1
                  font-bold
                  text-slate-900
                "
              >
                <Star
                  size={17}
                  className="fill-amber-400 text-amber-400"
                />
                4.8
              </span>

              <span className="text-sm text-slate-400">
                24 verified reviews
              </span>
            </div>

            {/* Price */}
            <div
              className="
                mt-7
                text-3xl
                font-black
                tracking-tight
                text-slate-950
              "
            >
              {formattedPrice}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {product.stock === undefined ? (
                <p className="text-sm font-bold text-slate-500">
                  Availability confirmed at checkout
                </p>
              ) : product.stock > 0 ? (
                <p className="text-sm font-bold text-emerald-600">
                  {product.stock} available now
                </p>
              ) : (
                <p className="text-sm font-bold text-red-500">
                  Out of stock
                </p>
              )}
            </div>

            {/* Description */}
            <p
              className="
                mt-6
                leading-7
                text-slate-500
              "
            >
              {product.description ||
                "A carefully selected gadget from Edame's collection. Every product is presented with clear pricing, stock status and a straightforward buying flow."}
            </p>

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex items-center gap-3">
              <div
                className="
                  flex
                  items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                "
              >
                <button
                  type="button"
                  onClick={decreaseQty}
                  disabled={!canDecrease}
                  aria-label="Decrease quantity"
                  className="
                    p-3
                    text-slate-700
                    transition-colors
                    hover:text-slate-950
                    disabled:cursor-not-allowed
                    disabled:text-slate-300
                  "
                >
                  <Minus size={17} />
                </button>

                <span
                  className="
                    w-10
                    text-center
                    font-bold
                    text-slate-950
                  "
                  aria-live="polite"
                >
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={increaseQty}
                  disabled={!canIncrease || isOutOfStock}
                  aria-label="Increase quantity"
                  className="
                    p-3
                    text-slate-700
                    transition-colors
                    hover:text-slate-950
                    disabled:cursor-not-allowed
                    disabled:text-slate-300
                  "
                >
                  <Plus size={17} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="
                  flex
                  h-12
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-slate-950
                  px-4
                  font-bold
                  text-white
                  transition-all
                  hover:bg-blue-600
                  disabled:cursor-not-allowed
                  disabled:bg-slate-300
                "
              >
                <ShoppingBag size={18} />

                {isOutOfStock
                  ? 'Out of stock'
                  : added
                    ? 'Added to cart'
                    : 'Add to cart'}
              </button>
            </div>

            {/* Buy now */}
            <button
              type="button"
              disabled={isOutOfStock}
              className="
                mt-3
                h-12
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                font-bold
                text-slate-950
                transition-all
                hover:border-slate-950
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:border-slate-200
                disabled:bg-slate-100
                disabled:text-slate-400
              "
            >
              Buy now · {formattedTotal}
            </button>

            {/* Trust features */}
            <div
              className="
                mt-8
                grid
                gap-3
                sm:grid-cols-2
              "
            >
              <div
                className="
                  rounded-2xl
                  bg-slate-50
                  p-4
                "
              >
                <Truck size={20} />

                <b className="mt-2 block text-slate-950">
                  Reliable delivery
                </b>

                <span className="text-xs text-slate-500">
                  Delivery information at checkout.
                </span>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-slate-50
                  p-4
                "
              >
                <ShieldCheck size={20} />

                <b className="mt-2 block text-slate-950">
                  Secure purchase
                </b>

                <span className="text-xs text-slate-500">
                  Protected checkout and order tracking.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Product information tabs */}
        <section
          className="
            mt-8
            rounded-[28px]
            border
            border-slate-200
            bg-white
            p-6
            md:p-10
          "
        >
          <div
            className="
              flex
              gap-6
              overflow-x-auto
              border-b
              border-slate-200
              pb-4
            "
          >
            {[
              'Details',
              'Specifications',
              'Reviews',
            ].map((tabName) => (
              <button
                key={tabName}
                type="button"
                onClick={() => setTab(tabName)}
                className={`
                  shrink-0
                  font-bold
                  transition-colors
                  ${
                    tab === tabName
                      ? 'text-blue-600'
                      : 'text-slate-400 hover:text-slate-700'
                  }
                `}
              >
                {tabName}
              </button>
            ))}
          </div>

          <div
            className="
              pt-6
              leading-7
              text-slate-600
            "
          >
            {tab === 'Details' && (
              <p>
                {product.description ||
                  'Product details will be managed from the admin dashboard, so the storefront never needs hardcoded product copy.'}
              </p>
            )}

            {tab === 'Specifications' && (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-x-6
                  gap-y-4
                  text-sm
                "
              >
                <span className="text-slate-400">
                  Category
                </span>

                <b className="text-slate-900">
                  {product.category || '—'}
                </b>

                <span className="text-slate-400">
                  Availability
                </span>

                <b className="text-slate-900">
                  {product.stock !== undefined
                    ? `${product.stock} units`
                    : 'Check at checkout'}
                </b>

                <span className="text-slate-400">
                  SKU
                </span>

                <b className="text-slate-900">
                  EDG-
                  {product._id
                    .slice(-6)
                    .toUpperCase()}
                </b>
              </div>
            )}

            {tab === 'Reviews' && (
              <p>
                Reviews will become a dedicated customer
                feature in the next commerce milestone.
              </p>
            )}
          </div>
        </section>

        {/* Related products */}
        <section className="py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">
                More to explore
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-black
                  text-slate-950
                "
              >
                You may also like
              </h2>
            </div>

            <Link
              to="/shop"
              className="
                text-sm
                font-bold
                text-blue-600
                hover:text-blue-700
              "
            >
              View all
            </Link>
          </div>

          {related.length > 0 ? (
            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >
              {related.slice(0, 4).map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className="
                    group
                    rounded-2xl
                  "
                >
                  <div
                    className="
                      overflow-hidden
                      rounded-2xl
                      bg-white
                    "
                  >
                    {relatedProduct.image ? (
                      <img
                        src={asset(relatedProduct.image)}
                        alt={relatedProduct.name}
                        loading="lazy"
                        className="
                          aspect-square
                          w-full
                          object-contain
                          p-5
                          transition-transform
                          duration-300
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div
                        className="
                          grid
                          aspect-square
                          place-items-center
                          text-xs
                          text-slate-400
                        "
                      >
                        No image
                      </div>
                    )}
                  </div>

                  <p
                    className="
                      mt-3
                      font-bold
                      text-slate-900
                      transition-colors
                      group-hover:text-blue-600
                    "
                  >
                    {relatedProduct.name}
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-semibold
                      text-slate-500
                    "
                  >
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                      maximumFractionDigits: 0,
                    }).format(
                      Number(relatedProduct.price || 0),
                    )}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="
                mt-5
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-white
                p-8
                text-center
                text-sm
                text-slate-400
              "
            >
              More products will appear here as the
              catalogue grows.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}