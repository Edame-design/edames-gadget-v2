import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  asset,
  getMyOrder,
  type Order,
} from "../lib/api";

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
    month: "long",
    year: "numeric",
  });
}

const statusSteps: {
  key: Order["status"];
  label: string;
  description: string;
  icon: typeof Clock3;
}[] = [
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Your order has been confirmed.",
    icon: CheckCircle2,
  },
  {
    key: "processing",
    label: "Processing",
    description: "Your order is being prepared.",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on its way.",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: CheckCircle2,
  },
];

function getStepIndex(status: Order["status"]) {
  switch (status) {
    case "pending":
      return -1;

    case "confirmed":
      return 0;

    case "processing":
      return 1;

    case "shipped":
      return 2;

    case "delivered":
      return 3;

    case "cancelled":
      return -2;

    default:
      return -1;
  }
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

function getPaymentStatusClass(
  status: Order["paymentStatus"],
) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";

    case "failed":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-violet-50 text-violet-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function CustomerOrderDetail() {
  const { id } = useParams();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-order", id],
    queryFn: () => getMyOrder(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-24">
        <div className="container-page py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading your order...
          </div>
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="min-h-screen bg-slate-50 pt-24">
        <div className="container-page py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-slate-950">
              Order not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              We couldn't find this order or you may not have
              access to it.
            </p>

            <Link
              to="/account/orders"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
            >
              <ArrowLeft size={16} />
              Back to orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <main className="min-h-screen bg-slate-50 pt-24">
      <div className="container-page py-8 sm:py-10">
        {/* Back */}
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to orders
        </Link>

        {/* Heading */}
        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              ORDER TRACKING
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              isCancelled
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {isCancelled
              ? "Cancelled"
              : order.status.charAt(0).toUpperCase() +
                order.status.slice(1)}
          </span>
        </section>

        {/* Tracking */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Track your order
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                We'll keep this status updated as your order
                moves through our process.
              </p>
            </div>

            <Truck
              size={25}
              className="hidden text-blue-600 sm:block"
            />
          </div>

          {isCancelled ? (
            <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-5">
              <p className="font-semibold text-red-800">
                This order has been cancelled.
              </p>

              <p className="mt-1 text-sm text-red-700">
                Please contact support if you need assistance
                with this order.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-slate-200" />

                  <div
                    className="absolute left-[12.5%] top-5 h-px bg-blue-600 transition-all"
                    style={{
                      width:
                        currentStep < 0
                          ? "0%"
                          : `${(currentStep / 3) * 75}%`,
                    }}
                  />

                  <div className="relative grid grid-cols-4">
                    {statusSteps.map(
                      (step, index) => {
                        const Icon = step.icon;
                        const completed =
                          currentStep >= index;
                        const active =
                          currentStep === index;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-col items-center text-center"
                          >
                            <div
                              className={`grid size-10 place-items-center rounded-full border-4 border-white ${
                                completed
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-400"
                              } ${
                                active
                                  ? "ring-4 ring-blue-100"
                                  : ""
                              }`}
                            >
                              {completed ? (
                                index < currentStep ? (
                                  <Check size={17} />
                                ) : (
                                  <Icon size={17} />
                                )
                              ) : (
                                <Icon size={17} />
                              )}
                            </div>

                            <p
                              className={`mt-3 text-sm font-bold ${
                                completed
                                  ? "text-slate-950"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </p>

                            <p className="mt-1 max-w-32 text-xs leading-5 text-slate-500">
                              {step.description}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                {statusSteps.map(
                  (step, index) => {
                    const Icon = step.icon;
                    const completed =
                      currentStep >= index;

                    return (
                      <div
                        key={step.key}
                        className={`flex gap-4 rounded-xl border p-4 ${
                          completed
                            ? "border-blue-100 bg-blue-50/50"
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <div
                          className={`grid size-10 shrink-0 place-items-center rounded-full ${
                            completed
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <div>
                          <p className="font-bold text-slate-950">
                            {step.label}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="font-bold text-slate-950">
                Items in this order
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-5 sm:p-6"
                >
                  <img
                    src={asset(item.image)}
                    alt={item.name}
                    className="size-20 shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-950">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatPrice(item.price)} ×{" "}
                      {item.quantity}
                    </p>

                    <p className="mt-3 font-bold text-slate-950">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="font-bold text-slate-950">
                Order summary
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-slate-500">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(order.shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-t border-slate-100 pt-4 text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="font-bold text-slate-950">
                Delivery
              </h2>

              <div className="mt-4 flex gap-3">
                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div className="text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-950">
                    {order.shippingAddress.fullName}
                  </p>

                  <p>
                    {order.shippingAddress.phone}
                  </p>

                  <p className="mt-1">
                    {order.shippingAddress.address}
                  </p>

                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="font-bold text-slate-950">
                Payment
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-slate-500">
                    Method
                  </p>

                  <p className="mt-1 font-semibold text-slate-950">
                    {getPaymentMethodLabel(
                      order.paymentMethod,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">
                    Payment status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getPaymentStatusClass(order.paymentStatus)}`}
                  >
                    {order.paymentStatus
                      .charAt(0)
                      .toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}