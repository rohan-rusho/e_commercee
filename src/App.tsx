import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes with layout */}
              <Route
                path="/"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Home />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/shop"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Shop />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/product/:slug"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <ProductDetail />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/cart"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Cart />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/checkout"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Checkout />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/auth"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Auth />
                    </main>
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Dashboard />
                    </main>
                    <Footer />
                  </div>
                }
              />

              {/* Admin routes without main layout */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <AdminRoute>
                    <AdminCoupons />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <AdminRoute>
                    <AdminReviews />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <AdminRoute>
                    <AdminMessages />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/banners"
                element={
                  <AdminRoute>
                    <AdminBanners />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
