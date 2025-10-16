import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient.ts";

import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Header />
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
