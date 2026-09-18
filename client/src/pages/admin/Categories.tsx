import {
  Edit3,
  FolderTree,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
  type Category,
} from "../../lib/api";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

export default function Categories() {
  const queryClient = useQueryClient();

  const [search, setSearch] =
    useState("");

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const createMutation =
    useMutation({
      mutationFn: createCategory,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["admin-categories"],
        });

        queryClient.invalidateQueries({
          queryKey: ["categories"],
        });

        resetForm();
      },

      onError: (error) => {
        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to create category",
        );
      },
    });

  const updateMutation =
    useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<Category>;
      }) =>
        updateCategory(id, data),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["admin-categories"],
        });

        queryClient.invalidateQueries({
          queryKey: ["categories"],
        });

        resetForm();
      },

      onError: (error) => {
        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to update category",
        );
      },
    });

  const deleteMutation =
    useMutation({
      mutationFn: deleteCategory,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["admin-categories"],
        });

        queryClient.invalidateQueries({
          queryKey: ["categories"],
        });
      },

      onError: (error) => {
        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to archive category",
        );
      },
    });

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setEditingId(null);
  }

  function startEditing(
    category: Category,
  ) {
    setEditingId(category._id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(
      category.description || "",
    );
  }

  function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!name.trim() || !slug.trim()) {
      window.alert(
        "Category name and slug are required.",
      );

      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description:
            description.trim(),
        },
      });

      return;
    }

    createMutation.mutate({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description:
        description.trim(),
    });
  }

  function handleDelete(
    category: Category,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${category.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(
      category._id,
    );
  }

  const filteredCategories =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      const activeCategories =
        categories.filter(
          (category) =>
            category.isActive !== false,
        );

      if (!query) {
        return activeCategories;
      }

      return activeCategories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(query) ||
          category.slug
            .toLowerCase()
            .includes(query),
      );
    }, [categories, search]);

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white">
            <div className="container-page py-6">
              <p className="text-sm font-medium text-blue-600">
                Admin / Categories
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Categories
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Organize products into clear
                storefront categories.
              </p>
            </div>
          </div>

          <div className="container-page py-6">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* Form */}
              <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Plus size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {editingId
                        ? "Edit category"
                        : "Add category"}
                    </h2>

                    <p className="text-xs text-slate-500">
                      Create a storefront category.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Name
                    </label>

                    <input
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Smartphones"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Slug
                    </label>

                    <input
                      value={slug}
                      onChange={(event) =>
                        setSlug(
                          event.target.value
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-",
                            ),
                        )
                      }
                      placeholder="e.g. smartphones"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value,
                        )
                      }
                      placeholder="Optional category description"
                      rows={4}
                      className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving
                        ? "Saving..."
                        : editingId
                          ? "Update category"
                          : "Create category"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* Category list */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-950">
                      Categories
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {filteredCategories.length} active
                      categor
                      {filteredCategories.length ===
                      1
                        ? "y"
                        : "ies"}
                    </p>
                  </div>

                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search categories..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {isLoading && (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Loading categories...
                  </div>
                )}

                {isError && (
                  <div className="p-8 text-center text-sm text-red-600">
                    Unable to load categories.
                  </div>
                )}

                {!isLoading &&
                  !isError &&
                  filteredCategories.length ===
                    0 && (
                    <div className="p-10 text-center">
                      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                        <FolderTree size={24} />
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        No categories yet
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Create your first category
                        using the form.
                      </p>
                    </div>
                  )}

                {!isLoading &&
                  !isError &&
                  filteredCategories.length >
                    0 && (
                    <div className="divide-y divide-slate-100">
                      {filteredCategories.map(
                        (category) => (
                          <div
                            key={category._id}
                            className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                                <FolderTree
                                  size={20}
                                />
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate font-semibold text-slate-900">
                                  {category.name}
                                </h3>

                                <p className="truncate text-xs text-slate-400">
                                  /{category.slug}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(
                                    category,
                                  )
                                }
                                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit category"
                              >
                                <Edit3
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deleteMutation.isPending
                                }
                                onClick={() =>
                                  handleDelete(
                                    category,
                                  )
                                }
                                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Archive category"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}