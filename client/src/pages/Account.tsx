import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import {
  asset,
  getMyOrders,
  type Order,
} from "../lib/api";

import { useAuth } from "../context/AuthContext";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(
  status: Order["status"],
) {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "processing":
      return "Processing";

    case "shipped":
      return "Shipped";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function getStatusClass(
  status: Order["status"],
) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";

    case "confirmed":
      return "bg-blue-50 text-blue-700";

    case "processing":
      return "bg-indigo-50 text-indigo-700";

    case "shipped":
      return "bg-violet-50 text-violet-700";

    case "delivered":
      return "bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusIcon(
  status: Order["status"],
) {
  switch (status) {
    case "pending":
      return <Clock3 size={17} />;

    case "confirmed":
      return <CheckCircle2 size={17} />;

    case "processing":
      return <Package size={17} />;

    case "shipped":
      return <Truck size={17} />;

    case "delivered":
      return <CheckCircle2 size={17} />;

    case "cancelled":
      return <Clock3 size={17} />;

    default:
      return <Package size={17} />;
  }
}

export default function Account() {
  const { user } = useAuth();

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
  });

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "confirmed" ||
      order.status === "processing",
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "shipped",
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "delivered",
  ).length;

  const recentOrders = orders.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 pt-24">
      <div className="container-page py-6 sm:py-8">

        {/* =================================================
            BACK TO STORE
        ================================================= */}

        <div className="mb-6">
          <Link
            to="/shop"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:border-blue-200
              hover:text-blue-600
            "
          >
            <ArrowLeft size={16} />
            Back to store
          </Link>
        </div>

        {/* =================================================
            ACCOUNT HEADER
        ================================================= */}

        <section className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            MY ACCOUNT
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Welcome back
                {user?.name
                  ? `, ${user.name.split(" ")[0]}`
                  : ""}
                .
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage your orders and keep track of your
                purchases.
              </p>
            </div>

            {/* Account actions */}

            <div className="flex flex-col gap-2 sm:flex-row">

              <Link
                to="/account/settings"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-600
                "
              >
                Account settings
              </Link>

              <Link
                to="/account/orders"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-slate-950
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-600
                "
              >
                View my orders
                <ArrowRight size={16} />
              </Link>

            </div>
          </div>
        </section>

        {/* =================================================
            ORDER STATS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total orders */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total orders
                </p>

                <p className="mt-2 text-3xl font-black text-slate-950">
                  {isLoading
                    ? "—"
                    : totalOrders}
                </p>
              </div>

              <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <ShoppingBag size={20} />
              </div>

            </div>
          </div>

          {/* In progress */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  In progress
                </p>

                <p className="mt-2 text-3xl font-black text-slate-950">
                  {isLoading
                    ? "—"
                    : pendingOrders}
                </p>
              </div>

              <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={20} />
              </div>

            </div>
          </div>

          {/* Shipped */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Shipped
                </p>

                <p className="mt-2 text-3xl font-black text-slate-950">
                  {isLoading
                    ? "—"
                    : shippedOrders}
                </p>
              </div>

              <div className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Truck size={20} />
              </div>

            </div>
          </div>

          {/* Delivered */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Delivered
                </p>

                <p className="mt-2 text-3xl font-black text-slate-950">
                  {isLoading
                    ? "—"
                    : deliveredOrders}
                </p>
              </div>

              <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>

            </div>
          </div>

        </section>

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep an eye on your latest purchases.
              </p>
            </div>

            <Link
              to="/account/orders"
              className="
                inline-flex
                w-fit
                items-center
                gap-1
                text-sm
                font-semibold
                text-blue-600
                hover:text-blue-700
              "
            >
              View all
              <ArrowRight size={15} />
            </Link>

          </div>

          {/* Loading */}

          {isLoading && (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading your orders...
            </div>
          )}

          {/* Error */}

          {isError && (
            <div className="p-8 text-center">

              <p className="font-semibold text-slate-900">
                We couldn't load your orders.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Please refresh the page and try again.
              </p>

            </div>
          )}

          {/* Empty */}

          {!isLoading &&
            !isError &&
            recentOrders.length === 0 && (
              <div className="p-8 text-center">

                <div className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <ShoppingBag size={22} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  No orders yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your purchases will appear here once you
                  place your first order.
                </p>

                <Link
                  to="/shop"
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-950
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-600
                  "
                >
                  Start shopping
                  <ArrowRight size={16} />
                </Link>

              </div>
            )}

          {/* Orders */}

          {!isLoading &&
            !isError &&
            recentOrders.length > 0 && (
              <div className="divide-y divide-slate-100">

                {recentOrders.map((order) => (
                  <Link
                    key={order._id}
                    to={`/account/orders/${order._id}`}
                    className="
                      block
                      p-5
                      transition
                      hover:bg-slate-50
                      sm:p-6
                    "
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* Order information */}

                      <div className="flex min-w-0 gap-4">

                        {/* Product images */}

                        <div className="flex -space-x-2">
                          {order.items
                            .slice(0, 3)
                            .map(
                              (
                                item,
                                index,
                              ) => (
                                <img
                                  key={`${order._id}-${item.productId}-${index}`}
                                  src={asset(
                                    item.image,
                                  )}
                                  alt={
                                    item.name
                                  }
                                  className="
                                    size-12
                                    rounded-xl
                                    border-2
                                    border-white
                                    bg-slate-100
                                    object-cover
                                  "
                                />
                              ),
                            )}
                        </div>

                        {/* Order details */}

                        <div className="min-w-0">

                          <p className="font-bold text-slate-950">
                            Order #
                            {order._id
                              .slice(-8)
                              .toUpperCase()}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.items.length}{" "}
                            {order.items.length ===
                            1
                              ? "item"
                              : "items"}{" "}
                            ·{" "}
                            {formatDate(
                              order.createdAt,
                            )}
                          </p>

                          <p className="mt-2 font-semibold text-slate-900">
                            {formatPrice(
                              order.total,
                            )}
                          </p>

                        </div>
                      </div>

                      {/* Status */}

                      <div className="flex items-center justify-between gap-4 lg:justify-end">

                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            ${getStatusClass(
                              order.status,
                            )}
                          `}
                        >
                          {getStatusIcon(
                            order.status,
                          )}

                          {getStatusLabel(
                            order.status,
                          )}
                        </span>

                        <ArrowRight
                          size={17}
                          className="text-slate-400"
                        />

                      </div>

                    </div>
                  </Link>
                ))}

              </div>
            )}

        </section>
      </div>
    </main>
  );
}