import {
  Mail,
  RefreshCw,
  Search,
  UserRound,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import { useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminCustomers,
  updateCustomerStatus,
  type Customer,
} from "../../lib/api";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

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

export default function Customers() {
  const queryClient =
    useQueryClient();

  const {
    data: customers = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Customer[]>({
    queryKey: ["admin-customers"],
    queryFn: getAdminCustomers,
  });

  const statusMutation =
    useMutation({
      mutationFn: ({
        id,
        isActive,
      }: {
        id: string;
        isActive: boolean;
      }) =>
        updateCustomerStatus(
          id,
          isActive,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["admin-customers"],
        });
      },
    });

  const [search, setSearch] =
    useState("");

  const filteredCustomers =
    customers.filter((customer) => {
      const query =
        search.toLowerCase().trim();

      if (!query) {
        return true;
      }

      return (
        customer.name
          .toLowerCase()
          .includes(query) ||
        customer.email
          .toLowerCase()
          .includes(query)
      );
    });

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.isActive,
    ).length;

  const inactiveCustomers =
    customers.filter(
      (customer) =>
        !customer.isActive,
    ).length;

  const handleStatusChange = (
    customer: Customer,
  ) => {
    const action =
      customer.isActive
        ? "deactivate"
        : "activate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${customer.name}'s account?`,
      );

    if (!confirmed) {
      return;
    }

    statusMutation.mutate({
      id: customer._id,
      isActive:
        !customer.isActive,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Admin
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                  Customers
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  View and manage customer accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Total customers
                  </p>

                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound size={19} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-black text-slate-950">
                  {customers.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Active
                  </p>

                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <UserRoundCheck size={19} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-black text-slate-950">
                  {activeCustomers}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Inactive
                  </p>

                  <div className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600">
                    <UserRoundX size={19} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-black text-slate-950">
                  {inactiveCustomers}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search customers by name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {isLoading ? (
                <div className="flex min-h-64 items-center justify-center p-8">
                  <p className="text-sm font-medium text-slate-500">
                    Loading customers...
                  </p>
                </div>
              ) : isError ? (
                <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-red-50 text-red-500">
                    <UserRoundX size={24} />
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-slate-950">
                    Unable to load customers
                  </h2>

                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    Something went wrong while loading customer accounts.
                  </p>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <UserRound size={24} />
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-slate-950">
                    {search
                      ? "No customers found"
                      : "No customers yet"}
                  </h2>

                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    {search
                      ? "Try a different name or email."
                      : "Customer accounts will appear here when they register."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Customer
                          </th>

                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Role
                          </th>

                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Joined
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.map(
                          (customer) => (
                            <tr
                              key={customer._id}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                                    <UserRound
                                      size={18}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">
                                      {customer.name}
                                    </p>

                                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                      <Mail
                                        size={13}
                                      />

                                      {customer.email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                                  {customer.role}
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                <span
                                  className={`
                                    inline-flex rounded-full px-3 py-1 text-xs font-bold
                                    ${
                                      customer.isActive
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-700"
                                    }
                                  `}
                                >
                                  {customer.isActive
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>

                              <td className="px-6 py-5 text-sm text-slate-500">
                                {formatDate(
                                  customer.createdAt,
                                )}
                              </td>

                              <td className="px-6 py-5 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(
                                      customer,
                                    )
                                  }
                                  disabled={
                                    statusMutation.isPending
                                  }
                                  className={`
                                    rounded-xl px-3 py-2 text-xs font-bold transition
                                    ${
                                      customer.isActive
                                        ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    }
                                    disabled:cursor-not-allowed disabled:opacity-50
                                  `}
                                >
                                  {customer.isActive
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredCustomers.map(
                      (customer) => (
                        <div
                          key={customer._id}
                          className="p-5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                              <UserRound
                                size={18}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-slate-900">
                                {customer.name}
                              </p>

                              <p className="mt-1 break-all text-sm text-slate-500">
                                {customer.email}
                              </p>
                            </div>

                            <span
                              className={`
                                shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold
                                ${
                                  customer.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }
                              `}
                            >
                              {customer.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                            <div>
                              <p className="text-xs font-medium text-slate-400">
                                Joined
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {formatDate(
                                  customer.createdAt,
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  customer,
                                )
                              }
                              disabled={
                                statusMutation.isPending
                              }
                              className={`
                                rounded-xl px-3 py-2 text-xs font-bold transition
                                ${
                                  customer.isActive
                                    ? "border border-red-200 bg-red-50 text-red-700"
                                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                }
                                disabled:cursor-not-allowed disabled:opacity-50
                              `}
                            >
                              {customer.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </div>
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