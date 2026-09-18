import { useNavigate } from "react-router-dom";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { AdminProductForm } from "../../components/admin/AdminProductForm";
import { createProduct } from "../../lib/api";

export default function AdminProductNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProduct,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      navigate("/admin/products");
    },
  });

  return (
    <AdminProductForm
      onSubmit={async (product) => {
        await mutation.mutateAsync(product);
      }}
      submitting={mutation.isPending}
    />
  );
}