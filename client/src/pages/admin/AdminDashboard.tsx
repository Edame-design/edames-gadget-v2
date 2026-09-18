import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { Link } from "react-router-dom";

import {
  getAdminAnalytics,
  type AdminAnalytics,
} from "../../lib/api";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

function formatCurrency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

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

function getStatusClasses(status: string) {
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

function getUserName(
  userId: AdminAnalytics["recentOrders"][number]["userId"],
) {
  if (
    typeof userId === "object" &&
    userId !== null
  ) {
    return userId.name;
  }

  return "Customer";
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof ShoppingBag;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<AdminAnalytics>({
    queryKey: [
      "admin-analytics",
    ],
    queryFn:
      getAdminAnalytics,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <AdminSidebar />

          <main className="min-w-0 flex-1">
            <div className="p-5 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl">
                <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-200" />

                <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-slate-200" />

                <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-36 animate-pulse rounded-2xl bg-slate-200"
                      />
                    ),
                  )}
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />

                  <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <AdminSidebar />

          <main className="min-w-0 flex-1">
            <div className="flex min-h-screen items-center justify-center p-6">
              <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600">
                  <BarChart3 size={28} />
                </div>

                <h1 className="mt-5 text-2xl font-black text-slate-950">
                  Unable to load dashboard
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong while loading dashboard analytics."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    refetch()
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  <RefreshCw size={16} />
                  Try again
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const {
    overview,
    orderStatuses,
    recentOrders,
    topProducts,
  } = analytics;

  const totalOrders =
    overview.orders;

  const activeOrders =
    orderStatuses.pending +
    orderStatuses.confirmed +
    orderStatuses.processing +
    orderStatuses.shipped;

  const deliveredOrders =
    orderStatuses.delivered;

  const cancelledOrders =
    orderStatuses.cancelled;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

              {/* HEADER */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                    Admin overview
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Dashboard
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Monitor your store performance,
                    orders, customers and inventory
                    from one place.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start">
                  <Link
                    to="/"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-slate-950
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-blue-600
                    "
                  >
                    <ShoppingBag size={16} />
                    View Store
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      refetch()
                    }
                    disabled={isFetching}
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
                      hover:border-slate-300
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <RefreshCw
                      size={16}
                      className={
                        isFetching
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Refresh
                  </button>
                </div>
              </div>

              {/* STATS */}

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total revenue"
                  value={formatCurrency(
                    overview.revenue,
                  )}
                  description="Revenue from non-cancelled orders"
                  icon={TrendingUp}
                />

                <StatCard
                  label="Total orders"
                  value={overview.orders.toLocaleString()}
                  description={`${activeOrders} active orders`}
                  icon={ShoppingBag}
                />

                <StatCard
                  label="Customers"
                  value={overview.customers.toLocaleString()}
                  description="Registered customers"
                  icon={Users}
                />

                <StatCard
                  label="Products"
                  value={overview.products.toLocaleString()}
                  description={`${overview.unitsSold} units sold`}
                  icon={Boxes}
                />
              </div>

              {/* MAIN GRID */}

              <div className="mt-6 grid gap-6 xl:grid-cols-2">

                {/* ORDER STATUS */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        Order status
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Current distribution of
                        customer orders.
                      </p>
                    </div>

                    <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                      <ClipboardList size={19} />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {(
                      [
                        [
                          "pending",
                          orderStatuses.pending,
                        ],
                        [
                          "confirmed",
                          orderStatuses.confirmed,
                        ],
                        [
                          "processing",
                          orderStatuses.processing,
                        ],
                        [
                          "shipped",
                          orderStatuses.shipped,
                        ],
                        [
                          "delivered",
                          orderStatuses.delivered,
                        ],
                        [
                          "cancelled",
                          orderStatuses.cancelled,
                        ],
                      ] as [
                        string,
                        number,
                      ][]
                    ).map(
                      ([
                        status,
                        count,
                      ]) => {
                        const percentage =
                          totalOrders > 0
                            ? Math.round(
                                (count /
                                  totalOrders) *
                                  100,
                              )
                            : 0;

                        return (
                          <div
                            key={status}
                          >
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-slate-700">
                                {formatStatus(
                                  status,
                                )}
                              </span>

                              <span className="font-bold text-slate-950">
                                {count}
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-slate-900 transition-all"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </section>

                {/* STORE HEALTH */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        Store overview
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        A quick snapshot of store
                        activity.
                      </p>
                    </div>

                    <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                      <BarChart3 size={19} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-medium text-slate-500">
                        Active orders
                      </p>

                      <p className="mt-2 text-3xl font-black text-slate-950">
                        {activeOrders}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Pending through shipped
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-5">
                      <p className="text-sm font-medium text-emerald-700">
                        Delivered
                      </p>

                      <p className="mt-2 text-3xl font-black text-emerald-900">
                        {deliveredOrders}
                      </p>

                      <p className="mt-1 text-xs text-emerald-700">
                        Successfully completed
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-5">
                      <p className="text-sm font-medium text-blue-700">
                        Units sold
                      </p>

                      <p className="mt-2 text-3xl font-black text-blue-950">
                        {overview.unitsSold}
                      </p>

                      <p className="mt-1 text-xs text-blue-700">
                        Across all non-cancelled orders
                      </p>
                    </div>

                    <div className="rounded-2xl bg-red-50 p-5">
                      <p className="text-sm font-medium text-red-700">
                        Cancelled
                      </p>

                      <p className="mt-2 text-3xl font-black text-red-950">
                        {cancelledOrders}
                      </p>

                      <p className="mt-1 text-xs text-red-700">
                        Orders cancelled
                      </p>
                    </div>

                  </div>
                </section>
              </div>

              {/* LOWER GRID */}

              <div className="mt-6 grid gap-6 xl:grid-cols-2">

                {/* TOP PRODUCTS */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        Top products
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Best-performing products by
                        units sold.
                      </p>
                    </div>

                    <Package
                      size={20}
                      className="text-slate-400"
                    />
                  </div>

                  {topProducts.length === 0 ? (
                    <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">
                      <Package
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No product sales yet
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {topProducts.map(
                        (
                          product,
                          index,
                        ) => (
                          <div
                            key={
                              product._id
                            }
                            className="flex items-center gap-4 rounded-xl border border-slate-100 p-3"
                          >
                            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-500">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  product.unitsSold
                                }{" "}
                                units sold
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-black text-slate-950">
                              {formatCurrency(
                                product.revenue,
                              )}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <Link
                    to="/admin/analytics"
                    className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    View full analytics

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </section>

                {/* RECENT ORDERS */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        Recent orders
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        The latest customer purchases.
                      </p>
                    </div>

                    <ShoppingBag
                      size={20}
                      className="text-slate-400"
                    />
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">
                      <ShoppingBag
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No orders yet
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Customer orders will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {recentOrders.map(
                        (order) => (
                          <Link
                            key={
                              order._id
                            }
                            to={`/admin/orders/${order._id}`}
                            className="block rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-bold text-slate-950">
                                    #
                                    {order._id
                                      .slice(
                                        -8,
                                      )
                                      .toUpperCase()}
                                  </p>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClasses(
                                      order.status,
                                    )}`}
                                  >
                                    {formatStatus(
                                      order.status,
                                    )}
                                  </span>
                                </div>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {
                                    getUserName(
                                      order.userId,
                                    )
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {formatDate(
                                    order.createdAt,
                                  )}
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-sm font-black text-slate-950">
                                  {formatCurrency(
                                    order.total,
                                  )}
                                </p>

                                <ArrowRight
                                  size={15}
                                  className="ml-auto mt-2 text-slate-400"
                                />
                              </div>
                            </div>
                          </Link>
                        ),
                      )}
                    </div>
                  )}

                  <Link
                    to="/admin/orders"
                    className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    View all orders

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </section>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}