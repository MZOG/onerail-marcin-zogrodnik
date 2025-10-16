import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import ProductForm from "./pages/ProductForm";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";

import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import RegisterPage from "./pages/Register";

function App() {
  useEffect(() => {
    const { refresh } = useAuthStore.getState();
    refresh();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <ProductForm mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:slug/edit"
          element={
            <ProtectedRoute>
              <ProductForm mode="edit" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="/products/:slug" element={<ProductDetails />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
