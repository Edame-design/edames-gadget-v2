import {
  BarChart3,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminAnalytics,
  type AdminAnalytics,
} from "../../lib/api";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

function formatCurrency(
  value: number,
) {
  return `₦${value.toLocaleString("en-NG")}`;
}

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
      month: "short",
      year: "numeric",
    },
  );
}

function formatStatus(
  status: string,
) {
  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getUserName(
  userId: AdminAnalytics["recentOrders"][number]["userId"],
) {
  if (
    typeof userId === "string"
  ) {
    return "Customer";
  }

  return userId?.name || "Customer";
}

export default function Analytics() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<AdminAnalytics>({
    queryKey: ["admin-analytics"],
    queryFn: getAdminAnalytics,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
       <div className="flex min-h-screen flex-col lg:flex-row">
          <AdminSidebar />

          <main className="min-w-0 flex-1">
            <div className="flex min-h-screen items-center justify-center">
              <p className="text-sm font-medium text-slate-500">
                Loading analytics...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
       <div className="flex min-h-screen flex-col lg:flex-row">
          <AdminSidebar />

          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="grid size-16 place-items-center rounded-full bg-red-50 text-red-500">
                  <BarChart3 size={28} />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-slate-950">
                  Unable to load analytics
                </h1>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  We couldn't retrieve your store analytics.
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
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
  } = data;

  const completedOrders =
    orderStatuses.delivered;

  const activeOrders =
    orderStatuses.pending +
    orderStatuses.confirmed +
    orderStatuses.processing +
    orderStatuses.shipped;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Admin
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                  Analytics
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Monitor your store's performance and order activity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    isFetching
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Total revenue
                  </p>

                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp size={19} />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-black text-slate-950">
                  {formatCurrency(
                    overview.revenue,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Orders
                  </p>

                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <ShoppingBag size={19} />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-black text-slate-950">
                  {overview.orders}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Customers
                  </p>

                  <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <Users size={19} />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-black text-slate-950">
                  {overview.customers}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Units sold
                  </p>

                  <div className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                    <Package size={19} />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-black text-slate-950">
                  {overview.unitsSold}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Order status
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Current order distribution
                    </p>
                  </div>

                  <BarChart3
                    size={20}
                    className="text-slate-400"
                  />
                </div>

                <div className="mt-6 space-y-4">
                  {Object.entries(
                    orderStatuses,
                  ).map(
                    ([
                      status,
                      count,
                    ]) => {
                      const totalOrders =
                        Math.max(
                          overview.orders,
                          1,
                        );

                      const percentage =
                        Math.round(
                          (count /
                            totalOrders) *
                            100,
                        );

                      return (
                        <div
                          key={status}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">
                              {formatStatus(
                                status,
                              )}
                            </span>

                            <span className="font-bold text-slate-900">
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

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Active orders
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-950">
                      {activeOrders}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-700">
                      Delivered
                    </p>

                    <p className="mt-1 text-xl font-black text-emerald-800">
                      {completedOrders}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Top products
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Best-performing products by units sold
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {topProducts.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-6 text-center">
                      <p className="text-sm text-slate-500">
                        No sales data yet.
                      </p>
                    </div>
                  ) : (
                    topProducts.map(
                      (
                        product,
                        index,
                      ) => (
                        <div
                          key={
                            product._id
                          }
                          className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                        >
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-600">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-900">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                product.unitsSold
                              }{" "}
                              units sold
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-bold text-slate-900">
                            {formatCurrency(
                              product.revenue,
                            )}
                          </p>
                        </div>
                      ),
                    )
                  )}
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h2 className="font-bold text-slate-950">
                  Recent orders
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest customer orders
                </p>
              </div>

              {recentOrders.length === 0 ? (
                <div className="p-10 text-center">
                  <ShoppingBag
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    No orders yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map(
                    (order) => (
                      <div
                        key={order._id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            #{order._id.slice(
                              -8,
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {getUserName(
                              order.userId,
                            )}{" "}
                            ·{" "}
                            {formatDate(
                              order.createdAt,
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {formatStatus(
                              order.status,
                            )}
                          </span>

                          <p className="font-bold text-slate-950">
                            {formatCurrency(
                              order.total,
                            )}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}