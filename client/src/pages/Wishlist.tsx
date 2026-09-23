import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  asset,
  type Product,
} from "../lib/api";

import {
  addToCart,
} from "../lib/cart";

import {
  getWishlist,
  removeFromWishlist,
} from "../lib/wishlist";

import {
  useAuth,
} from "../context/AuthContext";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatPrice(
  price: number,
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(price);
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function Wishlist() {
  const navigate =
    useNavigate();

  const {
    isAuthenticated,
  } = useAuth();

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    removingId,
    setRemovingId,
  ] = useState<string | null>(
    null,
  );

  const [
    addingToCartId,
    setAddingToCartId,
  ] = useState<string | null>(
    null,
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD WISHLIST
  |--------------------------------------------------------------------------
  */

  const loadWishlist =
    async () => {
      try {
        setIsLoading(true);
        setError("");

        const wishlist =
          await getWishlist(
            isAuthenticated,
          );

        setProducts(
          wishlist,
        );
      } catch (err) {
        console.error(
          "Unable to load wishlist:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your wishlist.",
        );
      } finally {
        setIsLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadWishlist();
  }, [
    isAuthenticated,
  ]);

  /*
  |--------------------------------------------------------------------------
  | WISHLIST CHANGE LISTENER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleWishlistChange =
      () => {
        loadWishlist();
      };

    window.addEventListener(
      "wishlist:changed",
      handleWishlistChange,
    );

    return () => {
      window.removeEventListener(
        "wishlist:changed",
        handleWishlistChange,
      );
    };
  }, [
    isAuthenticated,
  ]);

  /*
  |--------------------------------------------------------------------------
  | REMOVE
  |--------------------------------------------------------------------------
  */

  const handleRemove =
    async (
      productId: string,
    ) => {
      try {
        setRemovingId(
          productId,
        );

        const updated =
          await removeFromWishlist(
            productId,
            isAuthenticated,
          );

        setProducts(
          updated,
        );

        window.dispatchEvent(
          new Event(
            "wishlist:changed",
          ),
        );
      } catch (err) {
        console.error(
          "Unable to remove wishlist item:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to remove this item.",
        );
      } finally {
        setRemovingId(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const handleAddToCart =
    async (
      product: Product,
    ) => {
      try {
        setAddingToCartId(
          product._id,
        );

        await addToCart(
          product,
          1,
        );

        window.dispatchEvent(
          new Event(
            "cart:changed",
          ),
        );
      } catch (err) {
        console.error(
          "Unable to add wishlist item to cart:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to add this item to your cart.",
        );
      } finally {
        setAddingToCartId(
          null,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container-page pt-28 pb-16 md:pt-32">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-slate-200" />

            <div className="mt-4 h-10 w-64 rounded bg-slate-200" />

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-square bg-slate-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-4 rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-10 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container-page pt-28 pb-16 md:pt-32">

        {/* HEADER */}

        <div className="mb-8">
          <Link
            to="/"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-slate-500
              transition
              hover:text-blue-600
            "
          >
            <ArrowLeft
              size={16}
            />

            Back to store
          </Link>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="
                    grid
                    size-11
                    shrink-0
                    place-items-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <Heart
                    size={22}
                    fill="currentColor"
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-blue-600
                    "
                  >
                    Saved for later
                  </p>

                  <h1
                    className="
                      mt-1
                      text-3xl
                      font-black
                      tracking-tight
                      text-slate-950
                      sm:text-4xl
                    "
                  >
                    My Wishlist
                  </h1>
                </div>
              </div>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Keep the gadgets you love
                close and come back to them
                whenever you're ready.
              </p>
            </div>

            {products.length > 0 && (
              <span
                className="
                  hidden
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-slate-600
                  shadow-sm
                  sm:inline-flex
                "
              >
                {products.length}{" "}
                {products.length === 1
                  ? "item"
                  : "items"}
              </span>
            )}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="
              mb-6
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* EMPTY STATE */}

        {products.length === 0 ? (
          <section
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              px-6
              py-16
              text-center
              shadow-sm
              sm:px-10
              sm:py-20
            "
          >
            <div
              className="
                mx-auto
                grid
                size-20
                place-items-center
                rounded-full
                bg-slate-100
                text-slate-400
              "
            >
              <Heart
                size={34}
              />
            </div>

            <h2
              className="
                mt-6
                text-2xl
                font-black
                tracking-tight
                text-slate-950
              "
            >
              Your wishlist is empty
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                text-sm
                leading-6
                text-slate-500
              "
            >
              Save products you love by
              tapping the heart icon on any
              gadget in the store.
            </p>

            <Link
              to="/shop"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-6
                py-3
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-blue-950/10
                transition
                hover:-translate-y-0.5
                hover:bg-blue-500
              "
            >
              Explore products
              <ShoppingBag
                size={17}
              />
            </Link>
          </section>
        ) : (
          /* PRODUCT GRID */

          <section>
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-2
                sm:gap-5
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {products.map(
                (product) => (
                  <article
                    key={product._id}
                    className="
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      shadow-sm
                      transition
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-xl
                    "
                  >
                    {/* IMAGE */}

                    <div
                      className="
                        relative
                        aspect-square
                        overflow-hidden
                        bg-slate-50
                      "
                    >
                      <Link
                        to={`/product/${product._id}`}
                        className="block size-full"
                      >
                        <img
                          src={asset(
                            product.image,
                          )}
                          alt={
                            product.name
                          }
                          className="
                            size-full
                            object-cover
                            transition
                            duration-500
                            group-hover:scale-105
                          "
                        />
                      </Link>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            product._id,
                          )
                        }
                        disabled={
                          removingId ===
                          product._id
                        }
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="
                          absolute
                          right-3
                          top-3
                          grid
                          size-9
                          place-items-center
                          rounded-full
                          bg-white/95
                          text-red-500
                          shadow-md
                          backdrop-blur
                          transition
                          hover:bg-red-50
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                      {/* STOCK */}

                      {product.stock <=
                        0 && (
                        <span
                          className="
                            absolute
                            bottom-3
                            left-3
                            rounded-full
                            bg-slate-950/90
                            px-2.5
                            py-1
                            text-[10px]
                            font-bold
                            text-white
                          "
                        >
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="p-4">
                      <p
                        className="
                          text-[11px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-blue-600
                        "
                      >
                        {product.category}
                      </p>

                      <Link
                        to={`/product/${product._id}`}
                        className="
                          mt-1
                          block
                          line-clamp-2
                          text-sm
                          font-bold
                          leading-5
                          text-slate-950
                          transition
                          hover:text-blue-600
                        "
                      >
                        {product.name}
                      </Link>

                      <p
                        className="
                          mt-3
                          text-base
                          font-black
                          text-slate-950
                        "
                      >
                        {formatPrice(
                          product.price,
                        )}
                      </p>

                      {/* ACTION */}

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(
                            product,
                          )
                        }
                        disabled={
                          product.stock <=
                            0 ||
                          addingToCartId ===
                            product._id
                        }
                        className="
                          mt-4
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-slate-950
                          px-4
                          py-3
                          text-xs
                          font-bold
                          text-white
                          transition
                          hover:bg-blue-600
                          disabled:cursor-not-allowed
                          disabled:bg-slate-200
                          disabled:text-slate-400
                        "
                      >
                        <ShoppingBag
                          size={15}
                        />

                        {addingToCartId ===
                        product._id
                          ? "Adding..."
                          : product.stock <=
                              0
                            ? "Out of stock"
                            : "Add to cart"}
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}