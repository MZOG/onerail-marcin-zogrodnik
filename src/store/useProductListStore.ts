import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isEqual } from "lodash";

export interface Filters {
  title: string;
  categoryId: number | "";
  price_min: number | "";
  price_max: number | "";
}

export type SortField = "title" | "price";
export type SortOrder = "asc" | "desc";

export interface Sort {
  field: SortField;
  order: SortOrder;
}

interface ProductListState {
  currentPage: number;
  setPage: (page: number) => void;
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  sort: Sort;
  setSort: (field: SortField, order: SortOrder) => void;
  hydrateFromUrl: (params: Record<string, string>) => void;
}

const initialFilters: Filters = {
  title: "",
  categoryId: "",
  price_min: "",
  price_max: "",
};

const initialSort: Sort = {
  field: "title",
  order: "asc",
};

export const useProductListStore = create<ProductListState>()(
  persist(
    (set, get) => ({
      currentPage: 0,
      filters: initialFilters,
      sort: initialSort,

      setPage: (page) => {
        if (get().currentPage !== page) {
          set({ currentPage: page });
        }
      },

      setFilter: (key, value) => {
        set((state) => {
          if (state.filters[key] === value) {
            return state;
          }

          const newFilters = { ...state.filters, [key]: value };

          // Validate price_min <= price_max
          if (
            (key === "price_min" || key === "price_max") &&
            newFilters.price_min !== "" &&
            newFilters.price_max !== "" &&
            Number(newFilters.price_min) > Number(newFilters.price_max)
          ) {
            return state; // Prevent invalid price range
          }

          return {
            filters: newFilters,
            currentPage: 0,
          };
        });
      },

      resetFilters: () => {
        const currentFilters = get().filters;
        if (
          !isEqual(currentFilters, initialFilters) ||
          get().currentPage !== 0
        ) {
          set({ filters: initialFilters, currentPage: 0 });
        }
      },

      setSort: (field, order) => {
        const currentSort = get().sort;
        if (currentSort.field === field && currentSort.order === order) {
          return;
        }
        set({ sort: { field, order }, currentPage: 0 });
      },

      hydrateFromUrl: (params) => {
        const newFilters = { ...initialFilters };
        let newPage = 0;
        const newSort = { ...initialSort };

        if (params.title) newFilters.title = params.title;
        if (params.categoryId)
          newFilters.categoryId = Number(params.categoryId);
        if (params.price_min !== undefined) {
          newFilters.price_min =
            params.price_min === "none" || params.price_min === ""
              ? ""
              : Number(params.price_min);
        }
        if (params.price_max !== undefined) {
          newFilters.price_max =
            params.price_max === "none" || params.price_max === ""
              ? ""
              : Number(params.price_max);
        }
        if (params.page && Number(params.page) > 0) {
          newPage = Number(params.page) - 1;
        }
        if (params.sort) {
          const [field, order] = params.sort.split(":");
          if (
            (field === "title" || field === "price") &&
            (order === "asc" || order === "desc")
          ) {
            newSort.field = field as SortField;
            newSort.order = order as SortOrder;
          }
        }

        set({
          filters: newFilters,
          currentPage: newPage,
          sort: newSort,
        });
      },
    }),
    {
      name: "product-list-storage",
      partialize: (state) => ({
        currentPage: state.currentPage,
        filters: state.filters,
        sort: state.sort,
      }),
    }
  )
);
