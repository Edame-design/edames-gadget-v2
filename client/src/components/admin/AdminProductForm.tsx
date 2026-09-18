import { useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getCategories,
  type Product,
} from "../../lib/api";

type AdminProductFormProps = {
  initialProduct?: Product;
  onSubmit: (
    product: Omit<
      Product,
      "_id" | "createdAt" | "updatedAt"
    >,
  ) => Promise<void>;
  submitting?: boolean;
};

export function AdminProductForm({
  initialProduct,
  onSubmit,
  submitting = false,
}: AdminProductFormProps) {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const [name, setName] = useState(
    initialProduct?.name || "",
  );

  const [slug, setSlug] = useState(
    initialProduct?.slug || "",
  );

  const [description, setDescription] =
    useState(
      initialProduct?.description || "",
    );

  const [price, setPrice] = useState(
    initialProduct?.price?.toString() || "",
  );

  const [image, setImage] = useState(
    initialProduct?.image || "",
  );

  const [category, setCategory] = useState(
    initialProduct?.category || "",
  );

  const [stock, setStock] = useState(
    initialProduct?.stock?.toString() || "0",
  );

  const [isActive, setIsActive] = useState(
    initialProduct?.isActive ?? true,
  );

  const [error, setError] = useState("");

  const handleNameChange = (
    value: string,
  ) => {
    setName(value);

    if (!initialProduct) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Product slug is required.");
      return;
    }

    if (!category.trim()) {
      setError("Product category is required.");
      return;
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setError(
        "Please enter a valid product price.",
      );
      return;
    }

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      setError(
        "Stock must be a whole number of 0 or more.",
      );
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: numericPrice,
        image: image.trim(),
        category: category.trim(),
        stock: numericStock,
        isActive,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save product.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container-page pt-28 pb-16 md:pt-32">
        <div className="mb-6">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Product management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {initialProduct
              ? "Edit product"
              : "Add product"}
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            {initialProduct
              ? "Update the product information below."
              : "Create a new product for the Edame's Gadget store."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Product name */}
            <div className="md:col-span-2">
              <label
                htmlFor="product-name"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Product name
              </label>

              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value,
                  )
                }
                placeholder="e.g. iPhone 17 Pro Max"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                disabled={submitting}
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="product-slug"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Slug
              </label>

              <input
                id="product-slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(event.target.value)
                }
                placeholder="iphone-17-pro-max"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                disabled={submitting}
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="product-category"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Category
              </label>

              <select
                id="product-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                disabled={
                  submitting ||
                  categoriesLoading ||
                  categoriesError
                }
              >
                {categoriesLoading ? (
                  <option value="">
                    Loading categories...
                  </option>
                ) : categoriesError ? (
                  <option value="">
                    Unable to load categories
                  </option>
                ) : categories.length === 0 ? (
                  <option value="">
                    No categories available
                  </option>
                ) : (
                  <>
                    {/* Preserve an existing product category
                        if that category was archived. */}
                    {initialProduct &&
                      category &&
                      !categories.some(
                        (item) =>
                          item.name === category,
                      ) && (
                        <option value={category}>
                          {category}
                        </option>
                      )}

                    <option value="">
                      Select a category
                    </option>

                    {categories.map((item) => (
                      <option
                        key={item._id}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {categoriesError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Categories could not be loaded.
                  Please refresh the page and try
                  again.
                </p>
              )}

              {!categoriesLoading &&
                !categoriesError &&
                categories.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Create a category from Admin →
                    Categories before adding a
                    product.
                  </p>
                )}
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="product-price"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Price (₦)
              </label>

              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="250000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                disabled={submitting}
              />
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="product-stock"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Stock quantity
              </label>

              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                placeholder="10"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                disabled={submitting}
              />
            </div>

            {/* Product image */}
            <div className="md:col-span-2">
              <label
                htmlFor="product-image"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Product image
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <ImageIcon
                  size={19}
                  className="shrink-0 text-slate-400"
                />

                <input
                  id="product-image"
                  type="text"
                  value={image}
                  onChange={(event) =>
                    setImage(event.target.value)
                  }
                  placeholder="image1.jpg"
                  className="w-full bg-transparent text-sm outline-none"
                  disabled={submitting}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                For now, enter an existing filename
                from client/public/products.
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="product-description"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Description
              </label>

              <textarea
                id="product-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Describe the product..."
                rows={6}
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                disabled={submitting}
              />
            </div>

            {/* Active */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(
                      event.target.checked,
                    )
                  }
                  className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  disabled={submitting}
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Active product
                  </span>

                  <span className="block text-xs text-slate-500">
                    Active products can appear in
                    the storefront.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/admin/products"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                submitting ||
                categoriesLoading ||
                categoriesError ||
                categories.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {submitting
                ? "Saving..."
                : initialProduct
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}