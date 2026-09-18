import {
  ArrowRight,
  CalendarDays,
  Package,
  ShoppingBag,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import {
  asset,
  getMyOrders,
  type Order,
  type OrderStatus,
} from "../lib/api";

function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getStatusClasses(
  status: OrderStatus,
) {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700";

    case "shipped":
      return "bg-blue-50 text-blue-700";

    case "processing":
      return "bg-violet-50 text-violet-700";

    case "confirmed":
      return "bg-cyan-50 text-cyan-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    case "pending":
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function OrderCard({
  order,
}: {
  order: Order;
}) {
  const itemCount = order.items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  return (
    <article className="rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">

      {/* HEADER */}

      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <h2 className="font-bold text-slate-950">
              Order #
              {order._id
                .slice(-8)
                .toUpperCase()}
            </h2>

            <span
              className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-bold
                ${getStatusClasses(
                  order.status,
                )}
              `}
            >
              {formatStatus(
                order.status,
              )}
            </span>

          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />

              {formatDate(
                order.createdAt,
              )}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Package size={14} />

              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </span>

          </div>

        </div>

        <div className="sm:text-right">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </p>

          <p className="mt-1 text-xl font-black text-slate-950">
            ₦
            {order.total.toLocaleString()}
          </p>

        </div>

      </div>

      {/* ITEMS */}

      <div className="p-5 sm:p-6">

        <div className="space-y-4">

          {order.items
            .slice(0, 3)
            .map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3"
              >

                <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                  {item.image ? (
                    <img
                      src={asset(item.image)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-slate-400">
                      <ShoppingBag
                        size={20}
                      />
                    </div>
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Qty:{" "}
                    {item.quantity}
                  </p>

                </div>

                <p className="text-sm font-bold text-slate-900">
                  ₦
                  {item.subtotal.toLocaleString()}
                </p>

              </div>
            ))}

        </div>

        {order.items.length > 3 && (
          <p className="mt-4 text-xs font-medium text-slate-400">
            +{" "}
            {order.items.length - 3}{" "}
            more{" "}
            {order.items.length - 3 ===
            1
              ? "item"
              : "items"}
          </p>
        )}

        {/* ACTION */}

        <div className="mt-5 border-t border-slate-100 pt-5">

          <Link
            to={`/order-confirmation/${order._id}`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
          >
            View order

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />

          </Link>

        </div>

      </div>

    </article>
  );
}

export default function Orders() {
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery<Order[]>({
    queryKey: [
      "my-orders",
    ],

    queryFn:
      getMyOrders,
  });

  if (isLoading) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">

        <div className="mx-auto max-w-4xl">

          <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-8 space-y-5">

            {[1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-3xl bg-slate-100"
                />
              ),
            )}

          </div>

        </div>

      </main>
    );
  }

  if (isError) {
    return (
      <main className="container-page pt-28 pb-16 md:pt-32">

        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600">
            <Package size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Unable to load orders
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {error instanceof Error
              ? error.message
              : "Something went wrong while loading your orders."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Try again
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="container-page pt-28 pb-16 md:pt-32">

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div>

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            My account
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            My orders
          </h1>

          <p className="mt-2 text-slate-500">
            Track and review your Edame's Gadget
            purchases.
          </p>

        </div>

        {/* EMPTY */}

        {orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto grid size-16 place-items-center rounded-full bg-slate-100 text-slate-500">
              <ShoppingBag size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your completed purchases will appear
              here. Find something you love and
              place your first order.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
            >
              Start shopping
            </Link>

          </div>
        ) : (

          /* ORDERS */

          <div className="mt-8 space-y-5">

            {orders.map(
              (order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                />
              ),
            )}

          </div>

        )}

      </div>

    </main>
  );
}