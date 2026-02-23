import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import ScrollToTop from "./components/ScrollToTop";
import { useTheme } from "./contexts/ThemeContext";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SingleProduct from "./pages/SingleProduct";
import Cart from "./pages/Cart";
import Store from "./pages/Store";
import New from "./pages/New";
import Checkout from "./pages/Checkout";
import Search from "./pages/Search";
import Connect from "./pages/Connect";
import Profile from "./pages/Profile";
import Maintenance from "./pages/Maintenance";

// Admin Pages
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminDashboard from "./pages/AdminDashboard";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import AdminSettings from "./pages/AdminSettings";

function App() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set this to false to unlock the site again
  const isUnderMaintenance = true;

  // Helper to toggle sidebar from navbar
  const toggleSidebar = () => {
    setIsSidebarOpen(true);
  };

  // If maintenance is active, render ONLY the maintenance page
  if (isUnderMaintenance) {
    return (
      <div className="App font-body dark:bg-neutral-900 min-h-screen">
        <Maintenance />
      </div>
    );
  }

  return (
    <div className="App font-body" id="outer-container">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme} // 2. Pass it dynamically here!
      />
      <BrowserRouter>
        <ScrollToTop />
        {/* Sidebar at Root Level */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Navbar Wrapper to pass down the toggle function */}
        {/* We use a layout wrapper for cleaner routes */}
        <Routes>
          <Route
            path="/"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Home />
              </Layout>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/cart"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Cart />
              </Layout>
            }
          />
          <Route
            path="/checkout"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Checkout />
              </Layout>
            }
          />
          <Route
            path="/store"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Store />
              </Layout>
            }
          />
          <Route
            path="/store/:searchCategory"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Store />
              </Layout>
            }
          />
          <Route
            path="/search/:searchText"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Search />
              </Layout>
            }
          />
          <Route
            path="/new"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <New />
              </Layout>
            }
          />
          <Route
            path="/connect"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Connect />
              </Layout>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/product/:productId"
            element={
              <Layout onMenuClick={toggleSidebar}>
                <SingleProduct />
              </Layout>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const Layout = ({ children, onMenuClick }) => {
  const location = useLocation();

  // toggles a class to restart the animation on every route change
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <>
      <Navbar onMenuClick={onMenuClick} />

      {/* Only animate the page content, not the navbar */}
      <div
        className={`page-transition ${animate ? "page-transition--in" : ""}`}
      >
        {children}
      </div>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
  onMenuClick: PropTypes.func,
};

export default App;
