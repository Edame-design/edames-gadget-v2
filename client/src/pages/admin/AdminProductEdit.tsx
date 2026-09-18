import { useNavigate, useParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { AdminProductForm } from "../../components/admin/AdminProductForm";
import {
  getAdminProducts,
  updateProduct,
  type Product,
} from "../../lib/api";

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
  });

  const product = products.find(
    (item) => item._id === id,
  );

  const mutation = useMutation({
    mutationFn: async (
      updatedProduct: Omit<
        Product,
        "_id" | "createdAt" | "updatedAt"
      >,
    ) => {
      if (!id) {
        throw new Error(
          "Product ID is missing.",
        );
      }

      return updateProduct(
        id,
        updatedProduct,
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["product", id],
      });

      navigate("/admin/products");
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container-page pt-28 pb-16 md:pt-32">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />

            <div className="mt-8 space-y-4">
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container-page pt-28 pb-16 md:pt-32">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-950">
              Product not found
            </h1>

            <p className="mt-2 text-slate-500">
              We couldn't find the product you are
              trying to edit.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/products")
              }
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to products
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AdminProductForm
      initialProduct={product}
      onSubmit={async (updatedProduct) => {
        await mutation.mutateAsync(
          updatedProduct,
        );
      }}
      submitting={mutation.isPending}
    />
  );
}