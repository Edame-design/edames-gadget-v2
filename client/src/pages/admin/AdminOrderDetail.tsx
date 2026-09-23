import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  asset,
  getAdminOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../lib/api";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

const statusOptions: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

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
      month: "long",
      year: "numeric",
    },
  );
}

function formatDateTime(date?: string) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
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

function formatPaymentStatus(
  status: Order["paymentStatus"],
) {
  switch (status) {
    case "paid":
      return "Paid";

    case "failed":
      return "Failed";

    case "refunded":
      return "Refunded";

    case "pending":
    default:
      return "Pending";
  }
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

function getUserName(
  userId: Order["userId"],
) {
  if (
    typeof userId === "object" &&
    userId !== null
  ) {
    return userId.name;
  }

  return "Customer";
}

function getUserEmail(
  userId: Order["userId"],
) {
  if (
    typeof userId === "object" &&
    userId !== null
  ) {
    return userId.email;
  }

  return "—";
}

export default function AdminOrderDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const queryClient =
    useQueryClient();

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Order[]>({
    queryKey: [
      "admin-orders",
    ],
    queryFn:
      getAdminOrders,
  });

  const order = orders.find(
    (item) =>
      item._id === id,
  );

  const statusMutation =
    useMutation({
      mutationFn: ({
        orderId,
        status,
      }: {
        orderId: string;
        status: OrderStatus;
      }) =>
        updateOrderStatus(
          orderId,
          status,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "admin-orders",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "admin-analytics",
          ],
        });
      },
    });

  const handleStatusChange = async (
    status: OrderStatus,
  ) => {
    if (!order) {
      return;
    }

    if (
      status === order.status
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Change order #${order._id
          .slice(-8)
          .toUpperCase()} status to ${formatStatus(
          status,
        )}?`,
      );

    if (!confirmed) {
      return;
    }

    await statusMutation.mutateAsync(
      {
        orderId: order._id,
        status,
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">

       <div className="flex min-h-screen flex-col lg:flex-row">

          <AdminSidebar />

          <main className="min-w-0 flex-1">

            <div className="p-5 sm:p-6 lg:p-8">

              <div className="mx-auto max-w-6xl">

                <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

                <div className="mt-6 h-10 w-72 animate-pulse rounded-lg bg-slate-200" />

                <div className="mt-8 grid gap-6 lg:grid-cols-3">

                  <div className="h-80 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />

                  <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />

                </div>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="flex min-h-screen flex-col lg:flex-row">

          <AdminSidebar />

          <main className="min-w-0 flex-1">

            <div className="flex min-h-screen items-center justify-center p-6">

              <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

                <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600">
                  <Package size={28} />
                </div>

                <h1 className="mt-5 text-2xl font-black text-slate-950">
                  Unable to load order
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong while loading the order."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    refetch()
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  <RefreshCw
                    size={16}
                  />
                  Try again
                </button>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="flex min-h-screen flex-col lg:flex-row">

          <AdminSidebar />

          <main className="min-w-0 flex-1">

            <div className="p-5 sm:p-6 lg:p-8">

              <div className="mx-auto max-w-3xl">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin/orders",
                    )
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  <ArrowLeft
                    size={16}
                  />
                  Back to orders
                </button>

                <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <Package
                      size={28}
                    />
                  </div>

                  <h1 className="mt-5 text-2xl font-black text-slate-950">
                    Order not found
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    This order may have been
                    removed or is no longer
                    available.
                  </p>

                  <Link
                    to="/admin/orders"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    <ArrowLeft
                      size={16}
                    />
                    Back to orders
                  </Link>

                </div>

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

     <div className="flex min-h-screen flex-col lg:flex-row">

        <AdminSidebar />

        <main className="min-w-0 flex-1">

          <div className="p-5 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-6xl">

              {/* HEADER */}

              <div className="flex flex-col gap-5">

                <Link
                  to="/admin/orders"
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  <ArrowLeft
                    size={16}
                  />
                  Back to orders
                </Link>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                  <div>

                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                      Admin / Orders
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">

                      <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Order #
                        {order._id
                          .slice(
                            -8,
                          )
                          .toUpperCase()}
                      </h1>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                          order.status,
                        )}`}
                      >
                        {formatStatus(
                          order.status,
                        )}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Placed{" "}
                      {formatDateTime(
                        order.createdAt,
                      )}
                    </p>

                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                    <label
                      htmlFor="order-status"
                      className="text-sm font-semibold text-slate-600"
                    >
                      Update status
                    </label>

                    <select
                      id="order-status"
                      value={
                        order.status
                      }
                      onChange={(
                        event,
                      ) =>
                        handleStatusChange(
                          event
                            .target
                            .value as OrderStatus,
                        )
                      }
                      disabled={
                        statusMutation.isPending
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {statusOptions.map(
                        (
                          status,
                        ) => (
                          <option
                            key={
                              status
                            }
                            value={
                              status
                            }
                          >
                            {formatStatus(
                              status,
                            )}
                          </option>
                        ),
                      )}
                    </select>

                  </div>

                </div>

                {statusMutation.isError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {statusMutation.error instanceof
                    Error
                      ? statusMutation
                          .error
                          .message
                      : "Unable to update order status."}
                  </div>
                )}

              </div>

              {/* MAIN CONTENT */}

              <div className="mt-8 grid gap-6 lg:grid-cols-3">

                {/* LEFT */}

                <div className="space-y-6 lg:col-span-2">

                  {/* ORDER ITEMS */}

                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">

                      <div>

                        <h2 className="text-lg font-black text-slate-950">
                          Order items
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {order.items.length}{" "}
                          {order.items.length ===
                          1
                            ? "product"
                            : "products"}{" "}
                          in this order
                        </p>

                      </div>

                      <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <ShoppingBag
                          size={19}
                        />
                      </div>

                    </div>

                    <div className="divide-y divide-slate-100">

                      {order.items.map(
                        (item) => (
                          <div
                            key={
                              item.productId
                            }
                            className="flex gap-4 p-5 sm:p-6"
                          >

                            <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-24">

                              <img
                                src={asset(
                                  item.image,
                                )}
                                alt={
                                  item.name
                                }
                                className="h-full w-full object-contain"
                              />

                            </div>

                            <div className="min-w-0 flex-1">

                              <h3 className="font-bold text-slate-950">
                                {
                                  item.name
                                }
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                Unit price:{" "}
                                {formatCurrency(
                                  item.price,
                                )}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                Quantity:{" "}
                                {
                                  item.quantity
                                }
                              </p>

                            </div>

                            <div className="shrink-0 text-right">

                              <p className="text-sm font-black text-slate-950">
                                {formatCurrency(
                                  item.subtotal,
                                )}
                              </p>

                            </div>

                          </div>
                        ),
                      )}

                    </div>

                  </section>

                  {/* CUSTOMER */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex items-start gap-4">

                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <User
                          size={20}
                        />
                      </div>

                      <div>

                        <h2 className="text-lg font-black text-slate-950">
                          Customer
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Customer information
                          associated with this
                          order.
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Name
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {getUserName(
                            order.userId,
                          )}
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 break-all font-semibold text-slate-900">
                          {getUserEmail(
                            order.userId,
                          )}
                        </p>

                      </div>

                    </div>

                  </section>

                  {/* SHIPPING */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex items-start gap-4">

                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <MapPin
                          size={20}
                        />
                      </div>

                      <div>

                        <h2 className="text-lg font-black text-slate-950">
                          Delivery address
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Address supplied during
                          checkout.
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">

  {order.shippingAddress ? (
    <>
      <p className="font-bold text-slate-950">
        {order.shippingAddress.fullName}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {order.shippingAddress.address}
        <br />
        {order.shippingAddress.city},{" "}
        {order.shippingAddress.state}
      </p>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        Phone: {order.shippingAddress.phone}
      </p>
    </>
  ) : (
    <div className="flex items-center gap-3 text-sm text-slate-500">
      <MapPin
        size={17}
        className="shrink-0 text-slate-400"
      />

      <span>
        No delivery address was provided
        for this order.
      </span>
    </div>
  )}

</div>

                  </section>

                </div>

                {/* RIGHT */}

                <aside className="space-y-6">

                  {/* SUMMARY */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h2 className="text-lg font-black text-slate-950">
                          Order summary
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Financial breakdown.
                        </p>

                      </div>

                      <CreditCard
                        size={20}
                        className="text-slate-400"
                      />

                    </div>

                    <div className="mt-6 space-y-4">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-semibold text-slate-900">
                          {formatCurrency(
                            order.subtotal,
                          )}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Shipping
                        </span>

                        <span className="font-semibold text-slate-900">
                          {formatCurrency(
                            order.shippingFee,
                          )}
                        </span>

                      </div>

                      <div className="border-t border-slate-100 pt-4">

                        <div className="flex items-center justify-between">

                          <span className="font-bold text-slate-950">
                            Total
                          </span>

                          <span className="text-xl font-black text-slate-950">
                            {formatCurrency(
                              order.total,
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* PAYMENT */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex items-start gap-4">

                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <CreditCard
                          size={18}
                        />
                      </div>

                      <div>

                        <h2 className="font-black text-slate-950">
                          Payment
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            formatPaymentMethod(
                              order.paymentMethod,
                            )
                          }
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">

                      <span className="text-sm font-medium text-slate-600">
                        Payment status
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          order.paymentStatus ===
                          "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.paymentStatus ===
                                "failed"
                              ? "bg-red-50 text-red-700"
                              : order.paymentStatus ===
                                  "refunded"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.paymentStatus ===
                          "paid" && (
                          <CheckCircle2
                            size={13}
                          />
                        )}

                        {formatPaymentStatus(
                          order.paymentStatus,
                        )}
                      </span>

                    </div>

                  </section>

                  {/* ORDER INFO */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex items-start gap-4">

                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <CalendarDays
                          size={18}
                        />
                      </div>

                      <div>

                        <h2 className="font-black text-slate-950">
                          Order information
                        </h2>

                        <div className="mt-4 space-y-3 text-sm">

                          <div className="flex justify-between gap-4">

                            <span className="text-slate-500">
                              Order date
                            </span>

                            <span className="text-right font-semibold text-slate-900">
                              {formatDate(
                                order.createdAt,
                              )}
                            </span>

                          </div>

                          <div className="flex justify-between gap-4">

                            <span className="text-slate-500">
                              Items
                            </span>

                            <span className="font-semibold text-slate-900">
                              {
                                order.items
                                  .length
                              }
                            </span>

                          </div>

                          <div className="flex justify-between gap-4">

                            <span className="text-slate-500">
                              Status
                            </span>

                            <span className="font-semibold text-slate-900">
                              {formatStatus(
                                order.status,
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                  </section>

                </aside>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}