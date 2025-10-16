// src/__tests__/ProductDeleteButton.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { DeleteProduct, deleteProduct } from "@/components/DeleteProduct";
import { api } from "@/lib/axios";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@/lib/axios", () => ({
  api: {
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {
          Authorization: "",
        },
      },
    },
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Create a QueryClient for tests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper for QueryClientProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("deleteProduct function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully deletes a product and returns true", async () => {
    (api.delete as jest.Mock).mockResolvedValue({ data: true });

    const result = await deleteProduct(1);

    expect(api.delete).toHaveBeenCalledWith("/products/1");
    expect(result).toBe(true);
  });

  it("handles 401 error and throws specific message", async () => {
    const error = new AxiosError("Unauthorized", "401", undefined, null, {
      status: 401,
      data: { message: "Invalid token" },
      statusText: "",
      headers: {},
      config: { headers: {} as any },
    });
    (api.delete as jest.Mock).mockRejectedValue(error);

    await expect(deleteProduct(1)).rejects.toThrow("Invalid token");
    expect(api.delete).toHaveBeenCalledWith("/products/1");
  });

  it("handles non-Axios error and throws generic message", async () => {
    (api.delete as jest.Mock).mockRejectedValue(new Error("Network error"));

    await expect(deleteProduct(1)).rejects.toThrow(
      "An unexpected error occurred during deletion"
    );
  });
});

describe("ProductDeleteButton component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    queryClient.clear();
  });

  it("renders delete button correctly", () => {
    render(<DeleteProduct id={1} />, { wrapper });

    expect(
      screen.getByRole("button", { name: /remove product/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("triggers deletion on button click and shows success toast", async () => {
    (api.delete as jest.Mock).mockResolvedValue({ data: true });

    render(<DeleteProduct id={1} />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /remove product/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/products/1");
      expect(toast.success).toHaveBeenCalledWith("Product deleted");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error toast for 401 errors", async () => {
    const error = new AxiosError("Unauthorized", "401", undefined, null, {
      status: 401,
      data: { message: "Invalid token" },
      statusText: "",
      headers: {},
      config: { headers: {} as any },
    });
    (api.delete as jest.Mock).mockRejectedValue(error);

    render(<DeleteProduct id={1} />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /remove product/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error: Invalid token");
    });
  });

  it("shows error toast for non-401 errors", async () => {
    const error = new AxiosError("Not found", "404", undefined, null, {
      status: 404,
      data: { message: "Product not found" },
      statusText: "",
      headers: {},
      config: { headers: {} as any },
    });
    (api.delete as jest.Mock).mockRejectedValue(error);

    render(<DeleteProduct id={1} />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /remove product/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error: Product not found");
    });
  });

  it("cancels deletion if user clicks cancel", async () => {
    render(<DeleteProduct id={1} />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /remove product/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(api.delete).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
