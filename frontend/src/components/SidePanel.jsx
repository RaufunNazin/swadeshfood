import { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoChevronForwardOutline,
  IoBagHandleOutline,
  IoGridOutline,
  IoImagesOutline,
} from "react-icons/io5";
import { MdLogout, MdDashboard, MdShoppingCart } from "react-icons/md";
import api from "../api";

const SidePanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    // Quick role check
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    api
      .get("/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data.role !== 1) navigate("/");
        setUser(res.data);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const menuItemStyles = {
    button: ({ active }) => ({
      backgroundColor: active ? "#fff0f0" : undefined,
      color: active ? "#e11d48" : "#4b5563", // Assuming brand color is roughly rose-600
      borderRight: active ? "3px solid #e11d48" : "none",
      "&:hover": {
        backgroundColor: "#fff0f0",
        color: "#e11d48",
      },
    }),
  };

  return (
    <div className="h-screen sticky top-0 bg-white shadow-xl z-20 border-r border-gray-100">
      <Sidebar
        collapsed={collapsed}
        backgroundColor="#ffffff"
        className="h-full border-none"
      >
        <div className="p-5 flex items-center justify-between">
          {!collapsed && (
            <span className="font-bold text-xl text-brand">
              Swadesh<span className="text-gray-800">Admin</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <IoChevronForwardOutline
              className={`transition-transform duration-300 ${collapsed ? "rotate-0" : "rotate-180"}`}
            />
          </button>
        </div>

        <Menu menuItemStyles={menuItemStyles} className="mt-4">
          <MenuItem
            active={location.pathname === "/admin/dashboard"}
            icon={<MdDashboard size={20} />}
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </MenuItem>

          <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
            {!collapsed && "Management"}
          </div>

          <MenuItem
            active={location.pathname === "/admin/orders"}
            icon={<MdShoppingCart size={20} />}
            onClick={() => navigate("/admin/orders")}
          >
            Orders
          </MenuItem>
          <MenuItem
            active={location.pathname === "/admin/products"}
            icon={<IoBagHandleOutline size={20} />}
            onClick={() => navigate("/admin/products")}
          >
            Products
          </MenuItem>
          <MenuItem
            active={location.pathname === "/admin/categories"}
            icon={<IoGridOutline size={20} />}
            onClick={() => navigate("/admin/categories")}
          >
            Categories
          </MenuItem>
        </Menu>

        <div className="absolute bottom-5 w-full">
          <Menu menuItemStyles={menuItemStyles}>
            <MenuItem icon={<MdLogout size={20} />} onClick={logout}>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Sidebar>
    </div>
  );
};

export default SidePanel;
