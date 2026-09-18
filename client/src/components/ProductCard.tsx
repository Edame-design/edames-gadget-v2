import {
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";

import type { Product } from "../lib/api";
import { addToCart } from "../lib/cart";

type ProductCardProps = {
  product: Product;
};

function getProductImage(
  image?: string,
) {
  if (!image) {
    return "";
  }

  const trimmedImage =
    image.trim();

  if (!trimmedImage) {
    return "";
  }

  if (
    trimmedImage.startsWith(
      "http://",
    ) ||
    trimmedImage.startsWith(
      "https://",
    ) ||
    trimmedImage.startsWith("data:")
  ) {
    return trimmedImage;
  }

  if (
    trimmedImage.startsWith(
      "/products/",
    )
  ) {
    return trimmedImage;
  }

  if (
    trimmedImage.startsWith(
      "products/",
    )
  ) {
    return `/${trimmedImage}`;
  }

  return `/products/${trimmedImage}`;
}

export function ProductCard({
  product,
}: ProductCardProps) {
  const price = Number(
    product.price || 0,
  );

  const formattedPrice =
    new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      },
    ).format(price);

  const imageSrc =
    getProductImage(
      product.image,
    );

  const handleAddToCart =
    async () => {
      try {
        await addToCart(
          product,
          1,
        );
      } catch (error) {
        console.error(
          "Unable to add product to cart:",
          error,
        );
      }
    };

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-xl
      "
    >
      <div
        className="
          relative
          aspect-square
          overflow-hidden
          bg-slate-50
        "
      >
        <a
          href={`/product/${product._id}`}
          className="block h-full w-full"
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="
                h-full
                w-full
                object-contain
                p-5
                transition-transform
                duration-300
                group-hover:scale-105
              "
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div
              className="
                grid
                h-full
                w-full
                place-items-center
                p-5
                text-sm
                text-slate-400
              "
            >
              No image
            </div>
          )}
        </a>

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          className="
            absolute
            right-3
            top-3
            grid
            size-9
            place-items-center
            rounded-full
            border
            border-slate-200
            bg-white/90
            text-slate-500
            shadow-sm
            backdrop-blur
            transition
            hover:border-red-200
            hover:text-red-500
          "
        >
          <Heart size={16} />
        </button>

        {product.category && (
          <span
            className="
              absolute
              left-3
              top-3
              rounded-full
              bg-slate-900/90
              px-2.5
              py-1
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-white
            "
          >
            {product.category}
          </span>
        )}
      </div>

      <div className="p-4">
        <a
          href={`/product/${product._id}`}
          className="block"
        >
          <h3
            className="
              line-clamp-2
              min-h-10
              text-sm
              font-semibold
              leading-5
              text-slate-900
              transition-colors
              group-hover:text-blue-600
            "
          >
            {product.name}
          </h3>
        </a>

        <div
          className="
            mt-2
            flex
            items-center
            gap-1.5
            text-xs
            text-slate-500
          "
        >
          <span className="flex items-center gap-0.5 text-amber-500">
            <Star
              size={13}
              fill="currentColor"
            />

            <span className="font-semibold">
              4.8
            </span>
          </span>

          <span>•</span>

          <span>Popular</span>
        </div>

        <div
          className="
            mt-4
            flex
            items-end
            justify-between
            gap-2
          "
        >
          <div>
            <p
              className="
                text-base
                font-extrabold
                tracking-tight
                text-slate-950
              "
            >
              {formattedPrice}
            </p>

            {product.stock !==
              undefined && (
              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-slate-500
                "
              >
                {product.stock >
                0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              product.stock !==
                undefined &&
              product.stock <= 0
            }
            className="
              grid
              size-10
              shrink-0
              place-items-center
              rounded-xl
              bg-slate-900
              text-white
              transition
              hover:bg-blue-600
              disabled:cursor-not-allowed
              disabled:bg-slate-300
            "
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag
              size={17}
            />
          </button>
        </div>
      </div>
    </article>
  );
}