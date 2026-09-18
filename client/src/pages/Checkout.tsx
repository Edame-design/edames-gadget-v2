import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  asset,
  createOrder,
  type PaymentMethod,
  type ShippingAddress,
} from "../lib/api";

import {
  cartTotal,
  clearCart,
  getCart,
  type CartItem,
} from "../lib/cart";

import { useAuth } from "../context/AuthContext";

function formatPrice(price: number) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(price);
}

export default function Checkout() {
  const navigate = useNavigate();

  const {
    isAuthenticated,
  } = useAuth();

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [isLoadingCart, setIsLoadingCart] =
    useState(true);

  const [form, setForm] =
    useState<ShippingAddress>({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
    });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(
      "cash_on_delivery",
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Load the current cart.
   *
   * For authenticated customers this comes
   * from MongoDB.
   *
   * For guests it comes from localStorage.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      try {
        setIsLoadingCart(true);
        setError("");

        const items =
          await getCart();

        if (!cancelled) {
          setCartItems(items);
        }
      } catch (err) {
        console.error(
          "Unable to load checkout cart:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your cart.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCart(false);
        }
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const subtotal = useMemo(
    () => cartTotal(cartItems),
    [cartItems],
  );

  /*
   * Shipping is currently free.
   *
   * We can connect this to a real delivery
   * calculation later.
   */
  const shippingFee = 0;

  const total =
    subtotal + shippingFee;

  const updateField = (
    field: keyof ShippingAddress,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setError("");

   if (!isAuthenticated) {
  navigate("/login", {
    state: {
      from: "/checkout",
    },
  });

  return;
}

    if (cartItems.length === 0) {
      setError(
        "Your cart is empty.",
      );
      return;
    }

    const requiredFields: Array<
      keyof ShippingAddress
    > = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
    ];

    const missingField =
      requiredFields.find(
        (field) =>
          !form[field].trim(),
      );

    if (missingField) {
      setError(
        "Please complete all delivery details.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      /*
       * Send only product IDs and quantities.
       *
       * The backend remains responsible for
       * validating prices, stock and product
       * information.
       */
      const order =
  await createOrder({
    items: cartItems.map(
      (item) => ({
        productId: item._id,
        quantity: item.quantity,
      }),
    ),

    shippingAddress: {
      fullName:
        form.fullName.trim(),
      phone:
        form.phone.trim(),
      address:
        form.address.trim(),
      city:
        form.city.trim(),
      state:
        form.state.trim(),
    },

    paymentMethod,
  });

if (!order || !order._id) {
  throw new Error(
    "Order was created, but the server did not return a valid order.",
  );
}

await clearCart();

window.dispatchEvent(
  new Event("cart:changed"),
);

navigate(
  `/order-confirmation/${order._id}`,
);
      /*
       * The order has successfully been created
       * in MongoDB.
       *
       * Now clear the customer's actual cart.
       *
       * For authenticated customers this clears
       * the MongoDB cart.
       */
      await clearCart();

      /*
       * Header listens for this event and
       * refreshes the cart count.
       */
      window.dispatchEvent(
        new Event("cart:changed"),
      );

      /*
       * Send the customer to the existing
       * order confirmation page.
       */
      navigate(
        `/order-confirmation/${order._id}`,
      );
    } catch (err) {
      console.error(
        "Unable to place order:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to place your order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * Authentication guard.
   */
  if (!isAuthenticated) {
    return (
      <main className="container-page pt-20 pb-16 md:pt-24">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-blue-50 text-blue-600">
            <ShieldCheck size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Login required
          </h1>

          <p className="mx-auto mt-3 max-w-md text-slate-500">
            Please sign in to your Edame's Gadget
            account before completing your order.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Login to continue
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Cart loading state.
   */
  if (isLoadingCart) {
    return (
      <main className="container-page min-h-screen pt-28 pb-16 md:pt-32">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading your checkout...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Empty cart state.
   */
  if (cartItems.length === 0) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-slate-100 text-slate-500">
            <CreditCard size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Your cart is empty
          </h1>

          <p className="mt-3 text-slate-500">
            Add some products to your cart before
            starting checkout.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page pt-28 pb-16 md:pt-32">
      {/* PAGE HEADER */}

      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Checkout
        </h1>

        <p className="mt-2 text-slate-500">
          Complete your delivery details and place
          your order securely.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="font-semibold">
            Error:
          </span>

          <span>
            {error}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_380px]"
      >
        {/* LEFT COLUMN */}

        <div className="space-y-6">
          {/* DELIVERY */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Delivery information
                </h2>

                <p className="text-sm text-slate-500">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* FULL NAME */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(event) =>
                    updateField(
                      "fullName",
                      event.target.value,
                    )
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* PHONE */}

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value,
                    )
                  }
                  placeholder="0800 000 0000"
                  autoComplete="tel"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* CITY */}

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(event) =>
                    updateField(
                      "city",
                      event.target.value,
                    )
                  }
                  placeholder="Lagos"
                  autoComplete="address-level2"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* ADDRESS */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Delivery address
                </label>

                <textarea
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value,
                    )
                  }
                  placeholder="House number, street, area..."
                  rows={3}
                  autoComplete="street-address"
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* STATE */}

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  State
                </label>

                <input
                  id="state"
                  type="text"
                  value={form.state}
                  onChange={(event) =>
                    updateField(
                      "state",
                      event.target.value,
                    )
                  }
                  placeholder="Lagos"
                  autoComplete="address-level1"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </section>

          {/* PAYMENT */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Payment method
                </h2>

                <p className="text-sm text-slate-500">
                  Choose how you want to pay.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* CASH */}

              <label
                className={`
                  flex
                  cursor-pointer
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  p-4
                  transition
                  ${
                    paymentMethod ===
                    "cash_on_delivery"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={
                    paymentMethod ===
                    "cash_on_delivery"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "cash_on_delivery",
                    )
                  }
                  disabled={isSubmitting}
                  className="size-4 accent-blue-600"
                />

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Cash on delivery
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Pay when your order arrives.
                  </p>
                </div>
              </label>

              {/* BANK TRANSFER */}

              <label
                className={`
                  flex
                  cursor-pointer
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  p-4
                  transition
                  ${
                    paymentMethod ===
                    "bank_transfer"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={
                    paymentMethod ===
                    "bank_transfer"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "bank_transfer",
                    )
                  }
                  disabled={isSubmitting}
                  className="size-4 accent-blue-600"
                />

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Bank transfer
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Payment instructions will be
                    provided after ordering.
                  </p>
                </div>
              </label>

              {/* ONLINE */}

              <label
                className={`
                  flex
                  cursor-pointer
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  p-4
                  transition
                  ${
                    paymentMethod === "online"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={
                    paymentMethod === "online"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "online",
                    )
                  }
                  disabled={isSubmitting}
                  className="size-4 accent-blue-600"
                />

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Online payment
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Online payment integration will
                    be enabled in the payment milestone.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-950">
              Order summary
            </h2>

            {/* PRODUCTS */}

            <div className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={asset(item.image)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-slate-900">
                    {formatPrice(
                      item.price *
                        item.quantity,
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-slate-200" />

            {/* TOTALS */}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>

                <span>
                  {formatPrice(
                    subtotal,
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>

                <span>
                  {shippingFee === 0
                    ? "Free"
                    : formatPrice(
                        shippingFee,
                      )}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-950">
                <span>Total</span>

                <span>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* PLACE ORDER */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Placing order...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Place order
                </>
              )}
            </button>

            {/* TRUST */}

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-xs leading-5 text-slate-500">
                Your order is securely validated by
                our server. Product prices and stock
                are confirmed from the database before
                your order is created.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
}