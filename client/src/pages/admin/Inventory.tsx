import {
  AlertTriangle,
  Boxes,
  Edit3,
  Package,
  Search,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { useMemo, useState } from "react";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

import {
  getAdminProducts,
  asset,
  type Product,
} from "../../lib/api";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      label: "Out of stock",
      className:
        "bg-red-50 text-red-700",
    };
  }

  if (stock <= 5) {
    return {
      label: "Low stock",
      className:
        "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "In stock",
    className:
      "bg-emerald-50 text-emerald-700",
    };
  }

export default function Inventory() {
  const [search, setSearch] = useState("");

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
  });

  const activeProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.isActive !== false,
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return activeProducts;
    }

    return activeProducts.filter(
      (product) =>
        [
          product.name,
          product.category,
          product.slug,
        ].some((value) =>
          value
            ?.toLowerCase()
            .includes(query),
        ),
    );
  }, [activeProducts, search]);

  const totalProducts =
    activeProducts.length;

  const lowStockProducts =
    activeProducts.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5,
    ).length;

  const outOfStockProducts =
    activeProducts.filter(
      (product) =>
        product.stock <= 0,
    ).length;

  const totalUnits = activeProducts.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white">
            <div className="container-page py-6">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Admin / Inventory
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Inventory
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor product stock and keep
                  your catalogue available.
                </p>
              </div>
            </div>
          </div>

          <div className="container-page py-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Products
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {totalProducts}
                    </p>
                  </div>

                  <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Boxes size={21} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Total units
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {totalUnits}
                    </p>
                  </div>

                  <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Package size={21} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Low stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {lowStockProducts}
                    </p>
                  </div>

                  <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
                    <AlertTriangle size={21} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Out of stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {outOfStockProducts}
                    </p>
                  </div>

                  <div className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600">
                    <XCircle size={21} />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory table/card */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Stock levels
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review current stock for every
                    active product.
                  </p>
                </div>

                <div className="relative w-full md:max-w-md">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search inventory..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="divide-y divide-slate-100">
                  {Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className="size-14 animate-pulse rounded-xl bg-slate-100" />

                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                      </div>

                      <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="p-10 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
                    <Package size={22} />
                  </div>

                  <h2 className="mt-4 font-semibold text-slate-900">
                    Unable to load inventory
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Check that the backend is running
                    and try again.
                  </p>
                </div>
              )}

              {/* Empty */}
              {!isLoading &&
                !isError &&
                filteredProducts.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                      <Package size={24} />
                    </div>

                    <h2 className="mt-4 font-semibold text-slate-900">
                      {search
                        ? "No inventory found"
                        : "No inventory yet"}
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                      {search
                        ? "Try a different product name, category or slug."
                        : "Products will appear here once they are added."}
                    </p>
                  </div>
                )}

              {/* Desktop */}
              {!isLoading &&
                !isError &&
                filteredProducts.length > 0 && (
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Product
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Category
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Price
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Stock
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map(
                          (product) => {
                            const status =
                              getStockStatus(
                                product.stock,
                              );

                            return (
                              <tr
                                key={product._id}
                                className="transition hover:bg-slate-50"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={asset(
                                        product.image,
                                      )}
                                      alt={
                                        product.name
                                      }
                                      className="size-14 rounded-xl border border-slate-200 bg-slate-50 object-cover"
                                    />

                                    <div className="min-w-0">
                                      <p className="truncate font-semibold text-slate-900">
                                        {product.name}
                                      </p>

                                      <p className="mt-1 truncate text-xs text-slate-400">
                                        {product.slug}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {product.category}
                                </td>

                                <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                  {formatPrice(
                                    product.price,
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">
                                      {product.stock}
                                    </span>

                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
                                    >
                                      {status.label}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex justify-end">
                                    <Link
                                      to={`/admin/products/${product._id}/edit`}
                                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Edit3
                                        size={15}
                                      />
                                      Edit stock
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* Mobile */}
              {!isLoading &&
                !isError &&
                filteredProducts.length > 0 && (
                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredProducts.map(
                      (product) => {
                        const status =
                          getStockStatus(
                            product.stock,
                          );

                        return (
                          <article
                            key={product._id}
                            className="p-4"
                          >
                            <div className="flex gap-3">
                              <img
                                src={asset(
                                  product.image,
                                )}
                                alt={product.name}
                                className="size-16 shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-slate-900">
                                  {product.name}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                  {product.category}
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {formatPrice(
                                    product.price,
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {product.stock} units
                                </p>

                                <span
                                  className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              <Link
                                to={`/admin/products/${product._id}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit3 size={15} />
                                Edit
                              </Link>
                            </div>
                          </article>
                        );
                      },
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