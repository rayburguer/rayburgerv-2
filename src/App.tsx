import { useEffect, useState } from 'react';
// Vercel Redeploy Trigger: Ferrari Module Fully Integrated
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu } from './pages/Menu';
import { Header } from './components/Header';
import { CartSidebar } from './components/CartSidebar';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminOrders } from './pages/AdminOrders';
import { AdminMenu } from './pages/AdminMenu';
import { MarketingHub } from './pages/MarketingHub';
import { UserProfile } from './pages/UserProfile';
import { TestLab } from './pages/TestLab';
import { useSettingsStore } from './store/useSettingsStore';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const fetchExchangeRate = useSettingsStore((state) => state.fetchExchangeRate);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    fetchExchangeRate();
    initializeAuth();
  }, [fetchExchangeRate, initializeAuth]);

  return (
    <div className="relative min-h-screen bg-obsidian text-white font-sans antialiased">
      <Routes>
        <Route path="/" element={
          <>
            <Header onCartClick={() => setIsCartOpen(true)} />
            <Menu />
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </>
        } />
        <Route path="/menu" element={
          <>
            <Header onCartClick={() => setIsCartOpen(true)} />
            <Menu />
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </>
        } />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/marketing" element={<MarketingHub />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/test-lab" element={<TestLab />} />
      </Routes>
    </div>
  );
}

export default App;
