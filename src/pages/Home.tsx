import Container from "../components/Container";
import { fetchData } from "../lib/fetch";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useProductListStore } from "@/store/useProductListStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import useDebounce from "@/hooks/useDebounce";
import type { Product } from "@/types/Product";
import type { Category } from "@/types/Category";
import type {
  Sort,
  Filters,
  SortField,
  SortOrder,
} from "@/store/useProductListStore";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const PAGE_LIMIT = 12;
const PRICE_OPTIONS = [0, 50, 100, 250, 500, 1000, 2000];

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetchData(`categories`, { method: "GET" });
  return response;
};

const fetchProducts = async (
  page: number,
  filters: Filters
): Promise<Product[]> => {
  const offset = page * PAGE_LIMIT;
  let url = filters.categoryId
    ? `categories/${filters.categoryId}/products?limit=${PAGE_LIMIT}&offset=${offset}`
    : `products?limit=${PAGE_LIMIT}&offset=${offset}`;

  if (filters.title) url += `&title=${encodeURIComponent(filters.title)}`;
  if (filters.price_min !== "") url += `&price_min=${filters.price_min}`;
  if (filters.price_max !== "") url += `&price_max=${filters.price_max}`;

  const products = await fetchData(url, { method: "GET" });
  return products;
};

const filterAndSortProducts = (
  products: Product[],
  filters: Filters,
  sort: Sort
): Product[] => {
  if (!products) return [];

  let filteredProducts = products;
  // Apply price_min filter
  if (filters.price_min !== "") {
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= Number(filters.price_min)
    );
  }
  // Apply price_max filter
  if (filters.price_max !== "") {
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= Number(filters.price_max)
    );
  }

  return [...filteredProducts].sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];
    if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
    if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
    return 0;
  });
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLoadRef = useRef(true);

  const {
    currentPage: page,
    filters,
    sort,
    setPage,
    setFilter,
    setSort,
    resetFilters,
    hydrateFromUrl,
  } = useProductListStore();

  const debouncedFilters = useDebounce(
    {
      title: filters.title,
      categoryId: filters.categoryId,
      price_min: filters.price_min,
      price_max: filters.price_max,
    },
    500
  );

  useEffect(() => {
    if (initialLoadRef.current) {
      const paramsObject: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        paramsObject[key] = value;
      });
      if (Object.keys(paramsObject).length > 0) {
        hydrateFromUrl(paramsObject);
      }
      initialLoadRef.current = false;
    }
  }, [searchParams, hydrateFromUrl]);

  useEffect(() => {
    if (initialLoadRef.current) return;

    const newParams = new URLSearchParams();
    if (page > 0) newParams.set("page", String(page + 1));
    if (filters.title) newParams.set("title", filters.title);
    if (filters.categoryId)
      newParams.set("categoryId", String(filters.categoryId));
    if (filters.price_min !== "")
      newParams.set("price_min", String(filters.price_min));
    if (filters.price_max !== "")
      newParams.set("price_max", String(filters.price_max));
    const defaultSort = "title:asc";
    const currentSort = `${sort.field}:${sort.order}`;
    if (currentSort !== defaultSort) newParams.set("sort", currentSort);

    setSearchParams(newParams, { replace: true });
  }, [page, filters, sort, setSearchParams]);

  const {
    data: productsData,
    isLoading,
    error,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["products", page, debouncedFilters],
    queryFn: () => fetchProducts(page, debouncedFilters),
    placeholderData: keepPreviousData,
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    placeholderData: keepPreviousData,
  });

  const filteredAndSortedProducts = filterAndSortProducts(
    productsData || [],
    debouncedFilters,
    sort
  );
  const hasNextPage = productsData && productsData.length === PAGE_LIMIT;

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilter(name as keyof Filters, value);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split(":") as [SortField, SortOrder];
    setSort(field, order);
  };

  if (isLoading)
    return (
      <Container className="flex items-center justify-center mt-10">
        <Spinner />
      </Container>
    );
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!categories || isCategoriesLoading)
    return (
      <Container className="flex items-center justify-center mt-10">
        <Spinner />
      </Container>
    );

  const currentSortValue = `${sort.field}:${sort.order}`;

  return (
    <>
      <SEO
        title="Marcin Zogrodnik"
        description="OneRail Recruitment Task by Marcin Zogrodnik"
      />
      <Container>
        <div>
          <div className="controls flex items-center gap-10">
            <Input
              placeholder="Product name"
              name="title"
              value={filters.title}
              onChange={handleFilterChange}
              className="max-w-xs"
            />
            <Select
              value={
                filters.categoryId === "" ? "all" : String(filters.categoryId)
              }
              onValueChange={(val) => {
                const categoryValue = val === "all" ? "" : Number(val);
                setFilter("categoryId", categoryValue);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.length > 0 &&
                  categories?.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={currentSortValue} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title:asc">Title (A-Z)</SelectItem>
                <SelectItem value="title:desc">Title (Z-A)</SelectItem>
                <SelectItem value="price:asc">Price (Low to High)</SelectItem>
                <SelectItem value="price:desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                filters.price_min === "" ? "none" : String(filters.price_min)
              }
              onValueChange={(val) => {
                const numericValue = val === "none" ? "" : Number(val);
                setFilter("price_min", numericValue);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Min Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Min</SelectItem>
                {PRICE_OPTIONS.map((price) => (
                  <SelectItem key={`min-${price}`} value={String(price)}>
                    ${price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                filters.price_max === "" ? "none" : String(filters.price_max)
              }
              onValueChange={(val) => {
                const numericValue = val === "none" ? "" : Number(val);
                setFilter("price_max", numericValue);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Max Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Max</SelectItem>
                {PRICE_OPTIONS.map((price) => (
                  <SelectItem key={`max-${price}`} value={String(price)}>
                    ${price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-10"
            style={{ opacity: isPlaceholderData ? 0.5 : 1 }}
          >
            {filteredAndSortedProducts.map((product) => (
              <Link
                to={`/products/${product.slug}`}
                key={product.id}
                className="space-y-2"
              >
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="rounded-lg"
                />
                <h2 className="text-sm">{product.title}</h2>
                <p className="text-sm font-semibold">${product.price}</p>
              </Link>
            ))}
            {filteredAndSortedProducts.length === 0 && (
              <p>No products match your criteria.</p>
            )}
          </div>

          <div className="my-10 flex items-center justify-center gap-5">
            <Button
              size={"sm"}
              onClick={() => setPage(Math.max(page - 1, 0))}
              disabled={page === 0}
            >
              <ArrowLeft />
            </Button>
            <span>{page + 1}</span>
            <Button
              size={"sm"}
              onClick={() => hasNextPage && setPage(page + 1)}
              disabled={isPlaceholderData || !hasNextPage}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
