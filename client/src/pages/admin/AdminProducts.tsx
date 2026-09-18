import {
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useMemo, useState } from "react";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

import {
  getAdminProducts,
  deleteProduct,
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

export default function AdminProducts() {
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,

    onSuccess: (_deletedProduct, deletedId) => {
      // Remove the archived product immediately
      // from the admin list.
      queryClient.setQueryData<Product[]>(
        ["admin-products"],
        (currentProducts = []) =>
          currentProducts.filter(
            (product) =>
              product._id !== deletedId,
          ),
      );

      // Refresh both admin and public product data.
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error) => {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to archive product",
      );
    },
  });

  const filteredProducts = useMemo(() => {
    // Archived products should not appear in the
    // normal product management list.
    const activeProducts = products.filter(
      (product) =>
        product.isActive !== false,
    );

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
  }, [products, search]);

  function handleDelete(product: Product) {
    if (deleteMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      `Archive "${product.name}"? This will remove it from the public storefront.`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(product._id);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white">
            <div className="container-page py-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Admin / Products
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Products
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your store catalogue,
                    pricing and inventory.
                  </p>
                </div>

                <Link
                  to="/admin/products/new"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Add product
                </Link>
              </div>
            </div>
          </div>

          <div className="container-page py-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
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
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Package size={17} />

                  <span>
                    {filteredProducts.length} product
                    {filteredProducts.length === 1
                      ? ""
                      : "s"}
                  </span>
                </div>
              </div>

              {isLoading && (
                <div className="divide-y divide-slate-100">
                  {Array.from({ length: 5 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4"
                      >
                        <div className="size-14 animate-pulse rounded-xl bg-slate-100" />

                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                          <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                        </div>

                        <div className="hidden h-4 w-20 animate-pulse rounded bg-slate-100 md:block" />
                        <div className="hidden h-4 w-16 animate-pulse rounded bg-slate-100 md:block" />
                      </div>
                    ),
                  )}
                </div>
              )}

              {isError && (
                <div className="p-10 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
                    <Package size={22} />
                  </div>

                  <h2 className="mt-4 font-semibold text-slate-900">
                    Unable to load products
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Check that the backend is running
                    and try again.
                  </p>
                </div>
              )}

              {!isLoading &&
                !isError &&
                filteredProducts.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                      <Package size={24} />
                    </div>

                    <h2 className="mt-4 font-semibold text-slate-900">
                      {search
                        ? "No products found"
                        : "No products yet"}
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                      {search
                        ? "Try a different product name, category or slug."
                        : "Add your first product to start building the catalogue."}
                    </p>

                    {!search && (
                      <Link
                        to="/admin/products/new"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Plus size={17} />
                        Add first product
                      </Link>
                    )}
                  </div>
                )}

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
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map(
                          (product) => {
                            const stockStatus =
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
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="text-sm font-semibold text-slate-900">
                                      {product.stock}
                                    </span>

                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-medium ${stockStatus.className}`}
                                    >
                                      {
                                        stockStatus.label
                                      }
                                    </span>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-2">
                                    <Link
                                      to={`/admin/products/${product._id}/edit`}
                                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                      Edit
                                    </Link>

                                    <button
                                      type="button"
                                      disabled={
                                        deleteMutation.isPending
                                      }
                                      onClick={() =>
                                        handleDelete(
                                          product,
                                        )
                                      }
                                      className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Archive product"
                                    >
                                      <Trash2
                                        size={17}
                                      />
                                    </button>
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

              {!isLoading &&
                !isError &&
                filteredProducts.length > 0 && (
                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredProducts.map(
                      (product) => {
                        const stockStatus =
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
                                <h2 className="truncate font-semibold text-slate-900">
                                  {product.name}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                  {product.category}
                                </p>

                                <p className="mt-2 font-semibold text-slate-900">
                                  {formatPrice(
                                    product.price,
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <span className="text-sm font-semibold text-slate-900">
                                  {product.stock} in
                                  stock
                                </span>

                                <span
                                  className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${stockStatus.className}`}
                                >
                                  {
                                    stockStatus.label
                                  }
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <Link
                                  to={`/admin/products/${product._id}/edit`}
                                  className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit product"
                                >
                                  <Edit3 size={17} />
                                </Link>

                                <button
                                  type="button"
                                  disabled={
                                    deleteMutation.isPending
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      product,
                                    )
                                  }
                                  className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Archive product"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
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