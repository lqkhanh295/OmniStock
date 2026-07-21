import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import { ShoppingCart, LogOut, User as UserIcon } from 'lucide-react';
import { useCartStore } from './store/useCartStore';
import { useAuthStore } from './store/useAuthStore';

// ProtectedRoute component to enforce login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Dynamic Home Page based on Role
function RoleBasedHome() {
  const { isAdmin } = useAuthStore();
  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  return <CatalogPage />;
}

function AppHeader() {
  const itemsCount = useCartStore(state => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const { user, logout, isAdmin, isCustomer } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">ERP System</Link>
        <nav className="flex gap-4 items-center">
          
          {isAdmin() && (
            <Link to="/admin" className="text-blue-600 hover:text-blue-800 font-medium">Admin Panel</Link>
          )}

          {isCustomer() && (
            <>
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Catalog</Link>
              <Link to="/orders" className="text-gray-600 hover:text-gray-900 font-medium">My Orders</Link>
              <Link to="/checkout" className="text-gray-600 hover:text-gray-900 font-medium relative">
                <ShoppingCart className="w-6 h-6" />
                {itemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemsCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded-full transition-colors">
                <UserIcon className="w-4 h-4" /> {user.name}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="text-gray-600 hover:text-primary font-medium">Login</Link>
              <Link to="/register" className="bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><RoleBasedHome /></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer className="bg-white border-t py-6 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Enterprise ERP System. Built for portfolio.
        </footer>
      </div>
    </Router>
  );
}

export default App;
