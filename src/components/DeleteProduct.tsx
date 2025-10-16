import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ApiErrorResponse {
  message?: string;
}

// delete product
export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const { data } = await api.delete<boolean>(`/products/${id}`);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      throw new Error(
        apiError.response?.data?.message || "Failed to delete product"
      );
    }
    throw new Error("An unexpected error occurred during deletion");
  }
}

export function DeleteProduct({ id }: { id: number }) {
  const navigate = useNavigate();
  // delete mutation
  const deleteMutation = useMutation<
    boolean,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted");
      navigate("/");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleRemoveProduct = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="self-end">
          Remove product
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete selected
            product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600"
            onClick={handleRemoveProduct}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
