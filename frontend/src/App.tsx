import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";

// Definición de rutas de la aplicación.
// Cada ruta protegida exige el mismo permiso que el endpoint del backend.
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Productos */}
          <Route
            path="/products"
            element={
              <ProtectedRoute permission="producto:read">
                <ProductListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute permission="producto:create">
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute permission="producto:read">
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute permission="producto:update">
                <ProductFormPage />
              </ProtectedRoute>
            }
          />

          {/* Notificaciones */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute permission="notification:read">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Administración */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute permission="user:read">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Cualquier otra ruta va al listado (o al login si no hay sesión) */}
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
