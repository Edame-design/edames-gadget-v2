import {
  CalendarDays,
  ChevronDown,
  Eye,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../lib/api";

import { Link } from "react-router-dom";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatStatus(status: OrderStatus) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getStatusClasses(
  status: OrderStatus,
) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "processing":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "shipped":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
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

function getCustomerName(
  order: Order,
) {
  if (
    typeof order.userId === "object" &&
    order.userId
  ) {
    return order.userId.name;
  }

  return order.shippingAddress.fullName;
}

function getCustomerEmail(
  order: Order,
) {
  if (
    typeof order.userId === "object" &&
    order.userId
  ) {
    return order.userId.email;
  }

  return "—";
}

function getPaymentMethodLabel(
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

function OrderStatusSelect({
  order,
}: {
  order: Order;
}) {
  const queryClient =
    useQueryClient();

  const mutation =
    useMutation({
      mutationFn: (
        status: OrderStatus,
      ) =>
        updateOrderStatus(
          order._id,
          status,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["admin-orders"],
        });
      },
    });

  return (
    <div className="relative">
      <select
        value={order.status}
        disabled={mutation.isPending}
        onChange={(event) =>
          mutation.mutate(
            event.target.value as OrderStatus,
          )
        }
        className={`
          appearance-none rounded-xl border px-4 py-2 pr-9 text-sm font-semibold outline-none transition
          disabled:cursor-not-allowed disabled:opacity-60
          ${getStatusClasses(order.status)}
        `}
      >
        {orderStatuses.map(
          (status) => (
            <option
              key={status}
              value={status}
            >
              {formatStatus(status)}
            </option>
          ),
        )}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}

function OrderCard({
  order,
}: {
  order: Order;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Order
          </p>

          <h2 className="mt-1 font-bold text-slate-950">
            #{order._id.slice(-8).toUpperCase()}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={15} />

            {formatDate(order.createdAt)}
          </div>
        </div>

        <OrderStatusSelect order={order} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Customer
          </p>

          <div className="mt-2 flex items-start gap-2">
            <UserRound
              size={17}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div className="min-w-0">
              <p className="font-semibold text-slate-900">
                {getCustomerName(order)}
              </p>

              <p className="truncate text-sm text-slate-500">
                {getCustomerEmail(order)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Delivery
          </p>

          <div className="mt-2 flex items-start gap-2">
            <MapPin
              size={17}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <p className="text-sm leading-5 text-slate-600">
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <Package
            size={17}
            className="text-slate-500"
          />

          <p className="text-sm font-semibold text-slate-800">
            {order.items.length}{" "}
            {order.items.length === 1
              ? "item"
              : "items"}
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {order.items
            .slice(0, 3)
            .map((item) => (
              <div
                key={item.productId}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="line-clamp-1 text-slate-600">
                  {item.name} ×{" "}
                  {item.quantity}
                </span>

                <span className="shrink-0 font-semibold text-slate-800">
                  ₦
                  {item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}

          {order.items.length > 3 && (
            <p className="text-xs font-medium text-slate-400">
              + {order.items.length - 3} more
              items
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Payment
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {getPaymentMethodLabel(
              order.paymentMethod,
            )}
          </p>

          <p className="mt-1 text-xs capitalize text-slate-500">
            {order.paymentStatus}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </p>

          <p className="mt-1 text-xl font-black text-slate-950">
            ₦{order.total.toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AdminOrders() {
  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
  });

  return (
  <div className="min-h-screen bg-slate-50">
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <div className="container-page px-4 py-8 sm:px-6 lg:px-8">
          {/* HEADER */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Admin
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Orders
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage customer orders, delivery
                progress, and order status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* STATS */}

          {!isLoading &&
            !isError && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Total orders
                    </p>

                    <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <ShoppingBag size={19} />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-950">
                    {orders.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Pending
                  </p>

                  <p className="mt-4 text-3xl font-black text-amber-600">
                    {
                      orders.filter(
                        (order) =>
                          order.status ===
                          "pending",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Processing
                  </p>

                  <p className="mt-4 text-3xl font-black text-violet-600">
                    {
                      orders.filter(
                        (order) =>
                          order.status ===
                          "processing",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Delivered
                  </p>

                  <p className="mt-4 text-3xl font-black text-emerald-600">
                    {
                      orders.filter(
                        (order) =>
                          order.status ===
                          "delivered",
                      ).length
                    }
                  </p>
                </div>
              </div>
            )}

          {/* CONTENT */}

          <div className="mt-8">
            {isLoading && (
              <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading orders...
                </div>
              </div>
            )}

            {isError && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                <h2 className="font-bold text-red-800">
                  Unable to load orders
                </h2>

                <p className="mt-2 text-sm text-red-600">
                  Please check your connection
                  and try again.
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 inline-flex rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading &&
              !isError &&
              orders.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <ShoppingBag size={28} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-950">
                    No orders yet
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Customer orders will appear here
                    once they place their first order.
                  </p>

                  <Link
                    to="/admin/products"
                    className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Manage products
                  </Link>
                </div>
              )}

            {!isLoading &&
              !isError &&
              orders.length > 0 && (
                <>
                  {/* DESKTOP */}

                  <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1050px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Order
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Customer
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Date
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Items
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Total
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {orders.map(
                            (order) => (
                              <tr
                                key={order._id}
                                className="transition hover:bg-slate-50/70"
                              >
                                <td className="px-6 py-5">
                                  <p className="font-bold text-slate-950">
                                    #
                                    {order._id
                                      .slice(-8)
                                      .toUpperCase()}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state}
                                  </p>
                                </td>

                                <td className="px-6 py-5">
                                  <p className="font-semibold text-slate-900">
                                    {getCustomerName(
                                      order,
                                    )}
                                  </p>

                                  <p className="mt-1 max-w-[190px] truncate text-xs text-slate-500">
                                    {getCustomerEmail(
                                      order,
                                    )}
                                  </p>
                                </td>

                                <td className="px-6 py-5 text-sm text-slate-600">
                                  {formatDate(
                                    order.createdAt,
                                  )}
                                </td>

                                <td className="px-6 py-5">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {order.items.length}{" "}
                                    {order.items.length ===
                                    1
                                      ? "item"
                                      : "items"}
                                  </p>
                                </td>

                                <td className="px-6 py-5">
                                  <p className="font-bold text-slate-950">
                                    ₦
                                    {order.total.toLocaleString()}
                                  </p>

                                  <p className="mt-1 text-xs capitalize text-slate-400">
                                    {
                                      order.paymentStatus
                                    }
                                  </p>
                                </td>

                                <td className="px-6 py-5">
                                  <OrderStatusSelect
                                    order={
                                      order
                                    }
                                  />
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE */}

                  <div className="grid gap-4 lg:hidden">
                    {orders.map(
                      (order) => (
                        <OrderCard
                          key={order._id}
                          order={order}
                        />
                      ),
                    )}
                  </div>
                </>
              )}
          </div>
        </div>
      </main>
    </div>
  </div>
);
}