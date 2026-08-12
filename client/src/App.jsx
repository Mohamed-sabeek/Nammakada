import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

// Customer
import CustomerLayout from './components/CustomerLayout';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailsPage from './pages/customer/OrderDetailsPage';
import ProfilePage from './pages/customer/ProfilePage';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailsPage from './pages/admin/OrderDetailsPage';
import CustomersPage from './pages/admin/CustomersPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import NotificationsPage from './pages/shared/NotificationsPage';

import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return null;

  const isCustomer = isAuthenticated && user?.role === 'customer';
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <Routes>
      <Route path="/" element={isAdmin ? <Navigate to="/admin" /> : isCustomer ? <Navigate to="/customer/products" /> : <LandingPage />} />
      <Route path="/login" element={isAdmin ? <Navigate to="/admin" /> : isCustomer ? <Navigate to="/customer/products" /> : <LoginPage />} />
      <Route path="/register" element={isAdmin ? <Navigate to="/admin" /> : isCustomer ? <Navigate to="/customer/products" /> : <RegisterPage />} />
      
      {/* Customer Protected Routes */}
      <Route 
        path="/customer" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
