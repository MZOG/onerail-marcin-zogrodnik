import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 10 * 1000,
      staleTime: 0,
      retry: 1,
    },
  },
});
