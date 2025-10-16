import Container from "@/components/Container";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import type { Category } from "@/types/Category";
import type { Product } from "@/types/Product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

interface ProductFormProps {
  mode: "create" | "edit";
}

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  price: z.number().positive("Price must be greater than 0"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required"),
  categoryId: z.number().positive("Category is required"),
});

type NewProductProps = z.infer<typeof productSchema>;

// Fetch categories
const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>("/categories");
  return data;
};

// Create new product
const addNewProduct = async (body: NewProductProps): Promise<Product> => {
  const { data } = await api.post<Product>("/products", body);
  return data;
};

// Update product
const updateProduct = async (
  id: number,
  body: NewProductProps
): Promise<Product> => {
  const { data } = await api.put<Product>(`/products/${id}`, body);
  return data;
};

const uploadImage = async (): Promise<string> => {
  return Promise.resolve("https://placehold.co/500x500");
};

// Fetch product by slug
const fetchProductBySlug = async (slug: string | undefined) => {
  if (!slug) throw new Error("Slug is required");
  const { data } = await api.get<Product>(`products/slug/${slug}`);
  return data;
};

export default function ProductForm({ mode }: ProductFormProps) {
  const { slug } = useParams();

  const [productDetails, setProductDetails] = useState<NewProductProps>({
    title: "",
    price: 0,
    description: "",
    images: [],
    categoryId: 0,
  });

  // State for image previews
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch categories
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Fetch product data for edit mode
  const {
    data: productData,
    isLoading: isProductLoading,
    isFetched,
    error: productError,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: mode === "edit" && !!slug,
    retry: false,
  });

  // Set product details when product data is fetched in edit mode
  useEffect(() => {
    if (mode !== "edit" || !productData) return;

    const mappedData: NewProductProps = {
      title: productData.title || "",
      price: productData.price || 0,
      description: productData.description || "",
      images: Array.isArray(productData.images) ? productData.images : [],
      categoryId: productData.category?.id || 0,
    };

    setProductDetails(mappedData);
    setImagePreviews(mappedData.images);
  }, [mode, productData, isFetched]);

  useEffect(() => {
    if (mode === "create") {
      setProductDetails({
        title: "",
        price: 0,
        description: "",
        images: [],
        categoryId: 0,
      });
      setImagePreviews([]);
    }
  }, [mode]);

  // Handle text, number, and textarea changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setProductDetails((prev) => ({
      ...prev,
      categoryId: Number(value),
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const blobUrls = filesArray.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...blobUrls]);

    try {
      const uploadPromises = filesArray.map(uploadImage);
      const newUrls = await Promise.all(uploadPromises);

      setProductDetails((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));

      setImagePreviews((prev) => {
        const updated = [...prev];
        const startIndex = prev.length - blobUrls.length;
        newUrls.forEach((url, i) => {
          URL.revokeObjectURL(updated[startIndex + i]);
          updated[startIndex + i] = url;
        });
        return updated;
      });
    } catch (error) {
      console.error(error);
      toast.error("One or more image uploads failed. Please try again.");
      setImagePreviews((prev) =>
        prev.slice(0, prev.length - filesArray.length)
      );
    }
  };

  // Mutation for creating or updating product
  const mutation = useMutation({
    mutationFn: (data: NewProductProps) =>
      mode === "edit" && productData?.id
        ? updateProduct(productData.id, data)
        : addNewProduct(data),
    onSuccess: () => {
      setProductDetails({
        title: "",
        price: 0,
        description: "",
        images: [],
        categoryId: 0,
      });
      setImagePreviews([]);
      toast.success(
        mode === "edit"
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(`Error: ${message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = productSchema.safeParse(productDetails);
    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      toast.error(messages);
      return;
    }

    mutation.mutate(productDetails);
  };

  if (mode === "edit" && isProductLoading) {
    return (
      <Container className="max-w-3xl">
        <Spinner />
      </Container>
    );
  }

  if (mode === "edit" && productError) {
    return (
      <Container className="max-w-3xl">
        <p className="text-red-500">
          Error loading product: {productError.message}
        </p>
      </Container>
    );
  }

  if (categoriesError) {
    return (
      <Container className="max-w-3xl">
        <p className="text-red-500">
          Error loading categories: {categoriesError.message}
        </p>
      </Container>
    );
  }

  return (
    <>
      <SEO title={mode === "edit" ? "Edit product" : "Add new product"} />
      <Container className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "create" ? "Add New Product" : "Edit Product"}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="title">Product name</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={productDetails.title || ""}
              onChange={handleChange}
              placeholder="Product Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={productDetails.description || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={productDetails.price || 0}
              onChange={handleChange}
              placeholder="$99"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            {isCategoriesLoading ? (
              <Spinner />
            ) : (
              <Select
                value={
                  productDetails.categoryId === 0
                    ? ""
                    : productDetails.categoryId.toString()
                }
                onValueChange={handleCategoryChange}
                required
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="0" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images (upload to get URLs)</Label>
            <Input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Submitting..."
              : mode === "create"
              ? "Add new product"
              : "Update product"}
          </Button>
        </form>
      </Container>
    </>
  );
}
