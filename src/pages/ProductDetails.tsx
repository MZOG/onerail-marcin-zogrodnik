import Container from "@/components/Container";
import type { Product } from "@/types/Product";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/axios";
import { DeleteProduct } from "@/components/DeleteProduct";

// fetch product
const fetchProduct = async (slug?: string): Promise<Product> => {
  const { data } = await api.get(`products/slug/${slug}`);
  return data;
};

// related products
const fetchRelatedProducts = async (slug?: string): Promise<Product[]> => {
  const { data } = await api.get(`products/slug/${slug}/related`);
  return data;
};

export default function ProductDetails() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });

  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ["relatedProducts", slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: !!slug,
  });

  if (!product) {
    return (
      <Container className="flex justify-center mt-10">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="grid grid-cols-1 md:grid-cols-2 items-center gap-5 mt-5 md:gap-20 md:mt-10">
      {/* images */}
      <Carousel className="w-full">
        <CarouselContent>
          {product?.images?.map((image) => {
            return (
              <CarouselItem key={image}>
                <img src={image} className="rounded-2xl" />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="space-y-5">
        <h1 className="text-lg md:text-2xl font-medium">{product.title}</h1>

        {product.description && <p>{product.description}</p>}

        {product.category && (
          <div className="flex gap-2 items-center">
            <img
              src={product.category.image}
              alt={product.category.name}
              className="size-12 rounded-full"
            />
            <p>{product.category.name}</p>
          </div>
        )}

        {product.price && (
          <div className="flex justify-between items-center">
            <p className="text-green-800 text-lg font-semibold">
              ${product.price}
            </p>

            <Button>Add to cart</Button>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-10 flex flex-col gap-2 justify-end">
            <Button asChild size="sm" variant="outline" className="self-end">
              <Link to={`/products/${product.slug}/edit`}>Update product</Link>
            </Button>
            <DeleteProduct id={product.id} />
          </div>
        )}
      </div>

      {relatedProducts && relatedProducts?.length > 0 && (
        <div className="col-span-2">
          <h2 className="text-xl font-medium">Related products</h2>

          <Carousel className="my-5">
            <CarouselContent>
              {isLoading ? (
                <Spinner />
              ) : (
                relatedProducts &&
                relatedProducts.slice(0, 6).map((product) => {
                  return (
                    <CarouselItem
                      className="basis-1/4 space-y-3"
                      key={product.id}
                    >
                      <Link to={`/products/${product.slug}`}>
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="rounded-lg"
                        />
                        <h3 className="text-sm">{product.title}</h3>
                      </Link>
                    </CarouselItem>
                  );
                })
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </Container>
  );
}
