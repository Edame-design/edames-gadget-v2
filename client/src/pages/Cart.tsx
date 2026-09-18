import {
  ArrowRight,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getCart,
  updateCartItem as updateServerCartItem,
  removeCartItem as removeServerCartItem,
  clearCart as clearServerCart,
  type Product,
} from "../lib/api";

import {
  cartTotal,
  getCart as getLocalCart,
  updateCartItem as updateLocalCartItem,
  removeFromCart as removeLocalCartItem,
  clearCart as clearLocalCart,
  type CartItem,
} from "../lib/cart";

import {
  useAuth,
} from "../context/AuthContext";

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

function getProductFromCartItem(
  productId:
    | string
    | Product,
): Product | null {
  if (
    typeof productId ===
    "string"
  ) {
    return null;
  }

  return productId;
}

function getImage(
  image?: string,
) {
  if (!image) {
    return "/products/image1.jpg";
  }

  const trimmed =
    image.trim();

  if (
    trimmed.startsWith(
      "http://",
    ) ||
    trimmed.startsWith(
      "https://",
    ) ||
    trimmed.startsWith(
      "data:",
    )
  ) {
    return trimmed;
  }

  if (
    trimmed.startsWith(
      "/products/",
    )
  ) {
    return trimmed;
  }

  if (
    trimmed.startsWith(
      "products/",
    )
  ) {
    return `/${trimmed}`;
  }

  return `/products/${encodeURIComponent(
    trimmed,
  )}`;
}

export function Cart() {
  const navigate =
    useNavigate();

  const {
    isAuthenticated,
  } = useAuth();

  const [items, setItems] =
    useState<CartItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD CART
  |--------------------------------------------------------------------------
  */

  const loadCart =
    async () => {
      try {
        setLoading(true);
        setError("");

        if (!isAuthenticated) {
          const guestCart =
            await getLocalCart();

          setItems(
            guestCart,
          );

          return;
        }

        const cart =
          await getCart();

        const serverItems =
          cart.items
            .map((item) => {
              const product =
                getProductFromCartItem(
                  item.productId,
                );

              if (!product) {
                return null;
              }

              return {
                ...product,
                quantity:
                  item.quantity,
              };
            })
            .filter(
              (
                item,
              ): item is CartItem =>
                item !== null,
            );

        setItems(
          serverItems,
        );
      } catch (err) {
        console.error(
          "Unable to load cart:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your cart",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCart();
  }, [
    isAuthenticated,
  ]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE QUANTITY
  |--------------------------------------------------------------------------
  */

  const handleUpdateQuantity =
    async (
      productId: string,
      quantity: number,
    ) => {
      if (quantity < 1) {
        return;
      }

      try {
        setUpdatingId(
          productId,
        );

        setError("");

        if (!isAuthenticated) {
          const updated =
            updateLocalCartItem(
              productId,
              quantity,
            );

          setItems(updated);

          return;
        }

        const cart =
          await updateServerCartItem(
            productId,
            quantity,
          );

        const updatedItems =
          cart.items
            .map((item) => {
              const product =
                getProductFromCartItem(
                  item.productId,
                );

              if (!product) {
                return null;
              }

              return {
                ...product,
                quantity:
                  item.quantity,
              };
            })
            .filter(
              (
                item,
              ): item is CartItem =>
                item !== null,
            );

        setItems(
          updatedItems,
        );

        window.dispatchEvent(
          new Event(
            "cart:changed",
          ),
        );
      } catch (err) {
        console.error(
          "Unable to update cart item:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update cart",
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REMOVE ITEM
  |--------------------------------------------------------------------------
  */

  const handleRemove =
    async (
      productId: string,
    ) => {
      try {
        setUpdatingId(
          productId,
        );

        setError("");

        if (!isAuthenticated) {
          const updated =
            removeLocalCartItem(
              productId,
            );

          setItems(updated);

          return;
        }

        const cart =
          await removeServerCartItem(
            productId,
          );

        const updatedItems =
          cart.items
            .map((item) => {
              const product =
                getProductFromCartItem(
                  item.productId,
                );

              if (!product) {
                return null;
              }

              return {
                ...product,
                quantity:
                  item.quantity,
              };
            })
            .filter(
              (
                item,
              ): item is CartItem =>
                item !== null,
            );

        setItems(
          updatedItems,
        );

        window.dispatchEvent(
          new Event(
            "cart:changed",
          ),
        );
      } catch (err) {
        console.error(
          "Unable to remove cart item:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to remove item",
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | CLEAR CART
  |--------------------------------------------------------------------------
  */

  const handleClearCart =
    async () => {
      try {
        setLoading(true);
        setError("");

        if (!isAuthenticated) {
          clearLocalCart();

          setItems([]);

          return;
        }

        await clearServerCart();

        setItems([]);

        window.dispatchEvent(
          new Event(
            "cart:changed",
          ),
        );
      } catch (err) {
        console.error(
          "Unable to clear cart:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to clear cart",
        );
      } finally {
        setLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | TOTALS
  |--------------------------------------------------------------------------
  */

  const subtotal =
    cartTotal(items);

  const shippingFee =
    items.length > 0
      ? 0
      : 0;

  const total =
    subtotal +
    shippingFee;

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="container-page pt-28 pb-16 md:pt-32">
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-sm font-medium text-slate-500">
              Loading your cart...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EMPTY CART
  |--------------------------------------------------------------------------
  */

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="container-page pt-28 pb-16 md:pt-32">
          <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
            <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <ShoppingBagIcon />
              </div>

              <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Your cart is empty
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Looks like you haven't added
                anything to your cart yet.
                Explore our products and
                find something you'll love.
              </p>

              <Link
                to="/shop"
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-950
                  px-6
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:-translate-y-0.5
                  hover:bg-blue-600
                "
              >
                Continue shopping
                <ArrowRight
                  size={17}
                />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CART
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="container-page pt-28 pb-16 md:pt-32">
        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Shopping cart
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Your bag
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {items.length}{" "}
              {items.length ===
              1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleClearCart
            }
            className="
              self-start
              text-sm
              font-semibold
              text-slate-500
              transition
              hover:text-red-500
              sm:self-auto
            "
          >
            Clear cart
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* ITEMS */}

          <section className="space-y-4">
            {items.map(
              (item) => {
                const disabled =
                  updatingId ===
                  item._id;

                return (
                  <article
                    key={
                      item._id
                    }
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                      sm:p-5
                    "
                  >
                    <div className="flex gap-4 sm:gap-5">
                      {/* IMAGE */}

                      <Link
                        to={`/product/${item._id}`}
                        className="
                          flex
                          size-24
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-xl
                          bg-slate-50
                          sm:size-32
                        "
                      >
                        <img
                          src={getImage(
                            item.image,
                          )}
                          alt={
                            item.name
                          }
                          className="
                            h-full
                            w-full
                            object-contain
                            p-3
                          "
                        />
                      </Link>

                      {/* DETAILS */}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                              {item.category}
                            </p>

                            <Link
                              to={`/product/${item._id}`}
                              className="mt-1 block"
                            >
                              <h2 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950 transition hover:text-blue-600 sm:text-base">
                                {
                                  item.name
                                }
                              </h2>
                            </Link>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(
                                item._id,
                              )
                            }
                            disabled={
                              disabled
                            }
                            aria-label={`Remove ${item.name}`}
                            className="
                              grid
                              size-8
                              shrink-0
                              place-items-center
                              rounded-lg
                              text-slate-400
                              transition
                              hover:bg-red-50
                              hover:text-red-500
                              disabled:opacity-50
                            "
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>

                        <p className="mt-2 text-sm font-extrabold text-slate-950">
                          {formatPrice(
                            item.price,
                          )}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          {/* QUANTITY */}

                          <div className="flex items-center rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={
                                disabled ||
                                item.quantity <=
                                  1
                              }
                              aria-label="Decrease quantity"
                              className="
                                grid
                                size-9
                                place-items-center
                                text-slate-600
                                transition
                                hover:text-blue-600
                                disabled:cursor-not-allowed
                                disabled:text-slate-300
                              "
                            >
                              <Minus
                                size={15}
                              />
                            </button>

                            <span className="min-w-8 text-center text-sm font-bold text-slate-950">
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                disabled ||
                                item.quantity >=
                                  item.stock
                              }
                              aria-label="Increase quantity"
                              className="
                                grid
                                size-9
                                place-items-center
                                text-slate-600
                                transition
                                hover:text-blue-600
                                disabled:cursor-not-allowed
                                disabled:text-slate-300
                              "
                            >
                              <Plus
                                size={15}
                              />
                            </button>
                          </div>

                          {/* ITEM TOTAL */}

                          <p className="text-sm font-extrabold text-slate-950">
                            {formatPrice(
                              item.price *
                                item.quantity,
                            )}
                          </p>
                        </div>

                        {item.stock <=
                          5 && (
                          <p className="mt-2 text-[11px] font-medium text-amber-600">
                            Only{" "}
                            {
                              item.stock
                            }{" "}
                            left in stock
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </section>

          {/* SUMMARY */}

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-black text-slate-950">
                Order summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-slate-950">
                    {formatPrice(
                      subtotal,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span className="font-semibold text-slate-950">
                    {shippingFee ===
                    0
                      ? "Free"
                      : formatPrice(
                          shippingFee,
                        )}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-slate-200" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-950">
                  Total
                </span>

                <span className="text-xl font-black tracking-tight text-slate-950">
                  {formatPrice(
                    total,
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/checkout",
                  )
                }
                className="
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3.5
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
                Proceed to checkout
                <ArrowRight
                  size={17}
                />
              </button>

              <Link
                to="/shop"
                className="
                  mt-3
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:border-blue-200
                  hover:text-blue-600
                "
              >
                Continue shopping
              </Link>

              <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
                Your final delivery cost
                and order details will
                be confirmed during
                checkout.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY CART ICON
|--------------------------------------------------------------------------
*/

function ShoppingBagIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}