import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
  Store,
  Truck,
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
  getDeliveryQuote,
  type DeliveryMethod,
  type DeliveryQuote,
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

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>(
      "delivery",
    );

  const [deliveryQuote, setDeliveryQuote] =
    useState<DeliveryQuote | null>(
      null,
    );

  const [
    isLoadingDeliveryQuote,
    setIsLoadingDeliveryQuote,
  ] = useState(false);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>(
    "cash_on_delivery",
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD CART
  |--------------------------------------------------------------------------
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

  /*
  |--------------------------------------------------------------------------
  | TOTALS
  |--------------------------------------------------------------------------
  */

  const subtotal = useMemo(
    () => cartTotal(cartItems),
    [cartItems],
  );

  const shippingFee =
    deliveryMethod ===
    "pickup"
      ? 0
      : deliveryQuote?.status ===
          "estimated"
        ? deliveryQuote.fee
        : 0;

  const total =
    subtotal + shippingFee;

  /*
  |--------------------------------------------------------------------------
  | FORM HELPER
  |--------------------------------------------------------------------------
  */

  const updateField = (
    field: keyof ShippingAddress,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | DELIVERY QUOTE
  |--------------------------------------------------------------------------
  |
  | The frontend asks the backend for the delivery estimate.
  |
  | The frontend does NOT calculate or submit the trusted
  | delivery fee.
  |
  */

  useEffect(() => {
    if (
      deliveryMethod !==
      "delivery"
    ) {
      setDeliveryQuote(null);
      setIsLoadingDeliveryQuote(false);
      return;
    }

    const state =
      form.state.trim();

    const city =
      form.city.trim();

    if (!state || !city) {
      setDeliveryQuote(null);
      setIsLoadingDeliveryQuote(false);
      return;
    }

    let cancelled = false;

    const timeout =
      window.setTimeout(
        async () => {
          try {
            setIsLoadingDeliveryQuote(
              true,
            );
            setError("");

            const quote =
              await getDeliveryQuote(
                state,
                city,
              );

            if (!cancelled) {
              setDeliveryQuote(
                quote,
              );
            }
          } catch (err) {
            console.error(
              "Unable to calculate delivery fee:",
              err,
            );

            if (!cancelled) {
              setDeliveryQuote(null);

              setError(
                err instanceof Error
                  ? err.message
                  : "Unable to calculate delivery fee.",
              );
            }
          } finally {
            if (!cancelled) {
              setIsLoadingDeliveryQuote(
                false,
              );
            }
          }
        },
        500,
      );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    deliveryMethod,
    form.state,
    form.city,
  ]);

  /*
  |--------------------------------------------------------------------------
  | DELIVERY METHOD CHANGE
  |--------------------------------------------------------------------------
  */

  const handleDeliveryMethodChange = (
    method: DeliveryMethod,
  ) => {
    setDeliveryMethod(method);
    setError("");

    if (method === "pickup") {
      setDeliveryQuote(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT ORDER
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/checkout",
        },
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CART
    |--------------------------------------------------------------------------
    */

    if (cartItems.length === 0) {
      setError(
        "Your cart is empty.",
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | DELIVERY VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      deliveryMethod ===
      "delivery"
    ) {
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

      /*
      |--------------------------------------------------------------------------
      | DELIVERY QUOTE CHECK
      |--------------------------------------------------------------------------
      */

      if (
        isLoadingDeliveryQuote
      ) {
        setError(
          "Please wait while we calculate your delivery fee.",
        );

        return;
      }

      if (!deliveryQuote) {
        setError(
          "Unable to calculate your delivery fee. Please check your city and state.",
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | QUOTE REQUIRED
      |--------------------------------------------------------------------------
      |
      | This means the location has no configured
      | automatic delivery price.
      |
      | The order can still be created.
      | The delivery fee remains ₦0 until an admin
      | provides the final quote.
      |
      */

      if (
        deliveryQuote.status ===
        "quote_required"
      ) {
        // Order is allowed to continue.
        // Backend will store deliveryFeeStatus:
        // "quote_required"
      }
    }

    try {
      setIsSubmitting(true);

      /*
      |--------------------------------------------------------------------------
      | CREATE ORDER
      |--------------------------------------------------------------------------
      |
      | Only product IDs, quantities, delivery method
      | and delivery address are sent.
      |
      | Product prices and delivery fees remain
      | server-controlled.
      |
      */

      const order =
        await createOrder({
          items:
            cartItems.map(
              (item) => ({
                productId:
                  item._id,

                quantity:
                  item.quantity,
              }),
            ),

          shippingAddress:
            deliveryMethod ===
            "delivery"
              ? {
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
                }
              : undefined,

          paymentMethod,

          deliveryMethod,
        });

      if (
        !order ||
        !order._id
      ) {
        throw new Error(
          "Order was created, but the server did not return a valid order.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CLEAR CART
      |--------------------------------------------------------------------------
      */

      await clearCart();

      window.dispatchEvent(
        new Event("cart:changed"),
      );

      /*
      |--------------------------------------------------------------------------
      | ORDER CONFIRMATION
      |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | AUTHENTICATION GUARD
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | CART LOADING
  |--------------------------------------------------------------------------
  */

  if (isLoadingCart) {
    return (
      <main className="container-page min-h-screen pt-20 pb-16 md:pt-24">
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
  |--------------------------------------------------------------------------
  | EMPTY CART
  |--------------------------------------------------------------------------
  */

  if (cartItems.length === 0) {
    return (
      <main className="container-page pt-20 pb-16 md:pt-24">
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

  /*
  |--------------------------------------------------------------------------
  | MAIN CHECKOUT
  |--------------------------------------------------------------------------
  */

  return (
    <main className="container-page pt-20 pb-16 md:pt-24">
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
          Complete your order details and choose how you want to receive it.
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

          {/* DELIVERY METHOD */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Truck size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  How would you like to receive your order?
                </h2>

                <p className="text-sm text-slate-500">
                  Choose delivery or pickup.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {/* DELIVERY */}

              <button
                type="button"
                onClick={() =>
                  handleDeliveryMethodChange(
                    "delivery",
                  )
                }
                disabled={isSubmitting}
                className={`
                  flex
                  items-start
                  gap-4
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition
                  ${
                    deliveryMethod ===
                    "delivery"
                      ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/10"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <div
                  className={`
                    grid
                    size-11
                    shrink-0
                    place-items-center
                    rounded-xl
                    ${
                      deliveryMethod ===
                      "delivery"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  <Truck size={20} />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    Delivery
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Have your order delivered to your location.
                  </p>

                  {deliveryMethod ===
                    "delivery" && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                      <CheckCircle2 size={14} />
                      Selected
                    </span>
                  )}
                </div>
              </button>

              {/* PICKUP */}

              <button
                type="button"
                onClick={() =>
                  handleDeliveryMethodChange(
                    "pickup",
                  )
                }
                disabled={isSubmitting}
                className={`
                  flex
                  items-start
                  gap-4
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition
                  ${
                    deliveryMethod ===
                    "pickup"
                      ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/10"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <div
                  className={`
                    grid
                    size-11
                    shrink-0
                    place-items-center
                    rounded-xl
                    ${
                      deliveryMethod ===
                      "pickup"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  <Store size={20} />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    Pickup
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Pick up your order from the available pickup location.
                  </p>

                  {deliveryMethod ===
                    "pickup" && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                      <CheckCircle2 size={14} />
                      Selected
                    </span>
                  )}
                </div>
              </button>
            </div>
          </section>

          {/* DELIVERY INFORMATION */}

          {deliveryMethod ===
            "delivery" && (
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
                    value={
                      form.fullName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "fullName",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={
                      isSubmitting
                    }
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
                    value={
                      form.phone
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "phone",
                        event.target
                          .value,
                      )
                    }
                    placeholder="0800 000 0000"
                    autoComplete="tel"
                    disabled={
                      isSubmitting
                    }
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
                    value={
                      form.city
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "city",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Onitsha"
                    autoComplete="address-level2"
                    disabled={
                      isSubmitting
                    }
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
                    value={
                      form.address
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "address",
                        event.target
                          .value,
                      )
                    }
                    placeholder="House number, street, area..."
                    rows={3}
                    autoComplete="street-address"
                    disabled={
                      isSubmitting
                    }
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
                    value={
                      form.state
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "state",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Anambra"
                    autoComplete="address-level1"
                    disabled={
                      isSubmitting
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* DELIVERY QUOTE */}

                <div className="flex items-end">
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Delivery fee
                      </span>

                      {isLoadingDeliveryQuote ? (
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                          <span className="size-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                          Calculating...
                        </span>
                      ) : deliveryQuote?.status ===
                        "estimated" ? (
                        <span className="text-sm font-bold text-slate-950">
                          {formatPrice(
                            deliveryQuote.fee,
                          )}
                        </span>
                      ) : deliveryQuote?.status ===
                        "quote_required" ? (
                        <span className="text-sm font-bold text-amber-600">
                          Quote required
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Enter location
                        </span>
                      )}
                    </div>

                    {deliveryQuote?.status ===
                      "quote_required" && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Delivery pricing for this location will be confirmed separately.
                      </p>
                    )}

                    {deliveryQuote?.status ===
                      "estimated" && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Based on your selected city and state.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PICKUP INFORMATION */}

          {deliveryMethod ===
            "pickup" && (
            <section className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
                  <Store size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Pickup selected
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Your order will be prepared for pickup.
                    No delivery fee will be added to this order.
                  </p>
                </div>
              </div>
            </section>
          )}

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
                  disabled={
                    isSubmitting
                  }
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
                  disabled={
                    isSubmitting
                  }
                  className="size-4 accent-blue-600"
                />

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Bank transfer
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Payment instructions will be provided after ordering.
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
                    paymentMethod ===
                    "online"
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
                    paymentMethod ===
                    "online"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "online",
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className="size-4 accent-blue-600"
                />

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Online payment
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Online payment integration will be enabled in the payment milestone.
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
              {cartItems.map(
                (item) => (
                  <div
                    key={
                      item._id
                    }
                    className="flex gap-3"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={asset(
                          item.image,
                        )}
                        alt={
                          item.name
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Qty:{" "}
                        {
                          item.quantity
                        }
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-slate-900">
                      {formatPrice(
                        item.price *
                          item.quantity,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="my-6 border-t border-slate-200" />

            {/* TOTALS */}

            <div className="space-y-3 text-sm">

              <div className="flex justify-between text-slate-500">
                <span>
                  Subtotal
                </span>

                <span>
                  {formatPrice(
                    subtotal,
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>
                  {deliveryMethod ===
                  "pickup"
                    ? "Pickup"
                    : "Delivery"}
                </span>

                <span>
                  {deliveryMethod ===
                  "pickup"
                    ? "Free"
                    : isLoadingDeliveryQuote
                      ? "Calculating..."
                      : deliveryQuote?.status ===
                          "estimated"
                        ? formatPrice(
                            shippingFee,
                          )
                        : deliveryQuote?.status ===
                            "quote_required"
                          ? "Quote required"
                          : "—"}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-950">
                <span>
                  Current total
                </span>

                <span>
                  {formatPrice(
                    total,
                  )}
                </span>
              </div>

              {deliveryMethod ===
                "delivery" &&
                deliveryQuote?.status ===
                  "quote_required" && (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                    Delivery pricing for this location requires a separate quote. The current total does not include that future delivery charge.
                  </p>
                )}
            </div>

            {/* PLACE ORDER */}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingDeliveryQuote
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Placing order...
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={18}
                  />

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
                Your order is securely validated by our server. Product prices, stock and delivery pricing are confirmed from the database before your order is created.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
}