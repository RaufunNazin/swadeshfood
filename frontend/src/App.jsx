import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import AdminProducts from "./pages/AdminProducts";
import AdminImages from "./pages/AdminImages";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import SingleProduct from "./pages/SingleProduct";
import Cart from "./pages/Cart";
import Store from "./pages/Store";
import New from "./pages/New";

function App() {
  return (
    <div className="App font-body" id="outer-container">
      <div id="page-wrap">
        <BrowserRouter>
          <Sidebar id="sidebar" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store/:searchCategory" element={<Store />} />
            <Route path="/new" element={<New />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/product/:productId" element={<SingleProduct />} />
            <Route path="/admin/images" element={<AdminImages />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
