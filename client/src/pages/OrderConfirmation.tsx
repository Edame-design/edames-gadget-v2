import {
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import {
  asset,
  getMyOrder,
  type Order,
} from "../lib/api";


function formatDate(
  date?: string,
) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}


function formatStatus(
  status: Order["status"],
) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}


function formatPaymentStatus(
  status: Order["paymentStatus"],
) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
function formatPaymentMethod(
  method: Order["paymentMethod"],
) {
  switch (method) {
    case "cash_on_delivery":
      return "Cash on delivery";

    case "bank_transfer":
      return "Bank transfer";

    case "online":
      return "Online payment";

    default:
      return method;
  }
}

export default function OrderConfirmation() {
  const { id } = useParams();


  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: [
      "my-order",
      id,
    ],

    queryFn: () =>
      getMyOrder(id!),

    enabled:
      Boolean(id),
  });


  if (isLoading) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-5 font-medium text-slate-600">
            Loading your order...
          </p>

        </div>
      </main>
    );
  }


  if (
    isError ||
    !order
  ) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600">
            <PackageCheck size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Order not found
          </h1>

          <p className="mt-3 text-slate-500">
            We couldn't find this order or you
            don't have permission to view it.
          </p>

          <Link
            to="/account/orders"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            View my orders
          </Link>

        </div>
      </main>
    );
  }


  return (
    <main className="container-page pt-28 pb-16 md:pt-32">

      {/* SUCCESS HEADER */}

      <section className="mx-auto max-w-4xl">

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-10">

          <div className="mx-auto grid size-20 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">

            <CheckCircle2 size={42} />

          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Order placed successfully!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Thank you for shopping with Edame's
            Gadget. We've received your order and
            will begin processing it shortly.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">

            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Order #{order._id.slice(-8).toUpperCase()}
            </span>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              {formatDate(order.createdAt)}
            </span>

          </div>

        </div>


        {/* STATUS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={19} />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Order status
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {formatStatus(order.status)}
                </p>

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <PackageCheck size={19} />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {formatPaymentStatus(
                    order.paymentStatus,
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ORDER CONTENT */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* PRODUCTS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="flex items-center gap-3">

              <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <ShoppingBag size={19} />
              </div>

              <div>

                <h2 className="font-bold text-slate-950">
                  Items in your order
                </h2>

                <p className="text-sm text-slate-500">
                  {order.items.length}{" "}
                  {order.items.length === 1
                    ? "item"
                    : "items"}
                </p>

              </div>

            </div>


            <div className="mt-6 divide-y divide-slate-100">

              {order.items.map(
                (item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >

                    <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">

                      <img
                        src={asset(item.image)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Qty: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        ₦
                        {item.price.toLocaleString()}
                        {" "}each
                      </p>

                    </div>


                    <p className="shrink-0 font-bold text-slate-950">
                      ₦
                      {item.subtotal.toLocaleString()}
                    </p>

                  </div>
                ),
              )}

            </div>

          </section>


          {/* SUMMARY */}

          <aside className="space-y-6">

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <h2 className="font-bold text-slate-950">
                Order summary
              </h2>

              <div className="mt-5 space-y-3 text-sm">

                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>

                  <span>
                    ₦
                    {order.subtotal.toLocaleString()}
                  </span>
                </div>


                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>

                  <span>
                    {order.shippingFee === 0
                      ? "Free"
                      : `₦${order.shippingFee.toLocaleString()}`}
                  </span>
                </div>


                <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-950">

                  <span>Total</span>

                  <span>
                    ₦
                    {order.total.toLocaleString()}
                  </span>

                </div>

              </div>


              <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment method
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                 {formatPaymentMethod(
                  order.paymentMethod,
                )}
                </p>

              </div>

            </section>


            {/* DELIVERY ADDRESS */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">

                <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin size={19} />
                </div>

                <h2 className="font-bold text-slate-950">
                  Delivery address
                </h2>

              </div>


              <div className="mt-4 text-sm leading-6 text-slate-600">

                <p className="font-semibold text-slate-900">
                  {order.shippingAddress?.fullName ?? "—"}
                </p>

                <p>
                  {order.shippingAddress?.phone ?? "—"}
                </p>

                <p className="mt-2">
                 {order.shippingAddress?.address ?? "—"}
                </p>

                <p>
                  {order.shippingAddress?.city ?? "—"},{" "}
                  {order.shippingAddress?.state ?? "—"}
                </p>

              </div>

            </section>

          </aside>

        </div>


        {/* ACTIONS */}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Continue shopping
          </Link>

          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:border-blue-200 hover:text-blue-600"
          >
            View my orders
          </Link>

        </div>

      </section>

    </main>
  );
}