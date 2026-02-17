import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";

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

// Admin Pages
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminDashboard from "./pages/AdminDashboard";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper to toggle sidebar from navbar
  const toggleSidebar = () => {
    setIsSidebarOpen(true);
  };

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
        theme="light"
      />
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// Layout Component
const Layout = ({ children, onMenuClick }) => {
  return (
    <>
      <Navbar onMenuClick={onMenuClick} />
      {children}
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
  onMenuClick: PropTypes.func,
};

export default App;
