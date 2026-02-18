import { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoChevronForwardOutline,
  IoBagHandleOutline,
  IoGridOutline,
  IoHomeOutline,
  IoMoonOutline,
  IoSunnyOutline,
  IoLanguageOutline,
} from "react-icons/io5";
import { MdLogout, MdDashboard, MdShoppingCart } from "react-icons/md";
import api from "../api";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

const SidePanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});

  // Contexts
  const { theme, toggleTheme } = useTheme();
  const { language, switchLanguage, t } = useLanguage();

  const logout = () => {
    api
      .post("/logout")
      .then(() => navigate("/login"))
      .catch(() => navigate("/login"));
  };

  useEffect(() => {
    api
      .get("/me")
      .then((res) => {
        if (res.data.role !== 1) navigate("/");
        setUser(res.data);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const menuItemStyles = {
    button: ({ active }) => ({
      backgroundColor: active
        ? theme === "dark"
          ? "#374151"
          : "#fff0f0"
        : undefined,
      color: active ? "#e11d48" : theme === "dark" ? "#d1d5db" : "#4b5563",
      borderRight: active ? "3px solid #e11d48" : "none",
      "&:hover": {
        backgroundColor: theme === "dark" ? "#374151" : "#fff0f0",
        color: "#e11d48",
      },
    }),
  };

  return (
    <div className="h-screen sticky top-0 bg-white dark:bg-gray-900 shadow-xl z-20 border-r border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <Sidebar
        collapsed={collapsed}
        backgroundColor={theme === "dark" ? "#111827" : "#ffffff"}
        className="h-full border-none"
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          {!collapsed && (
            <span className="font-bold text-xl text-brand dark:text-green-400">
              {user.username || "Admin"}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <IoChevronForwardOutline
              className={`transition-transform duration-300 ${
                collapsed ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Menu Items */}
        <Menu menuItemStyles={menuItemStyles} className="mt-4">
          <MenuItem
            active={location.pathname === "/admin/dashboard"}
            icon={<MdDashboard size={20} />}
            onClick={() => navigate("/admin/dashboard")}
          >
            {t("dashboard")}
          </MenuItem>

          <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
            {!collapsed && t("management")}
          </div>

          <MenuItem
            active={location.pathname === "/admin/orders"}
            icon={<MdShoppingCart size={20} />}
            onClick={() => navigate("/admin/orders")}
          >
            {t("orders")}
          </MenuItem>
          <MenuItem
            active={location.pathname === "/admin/products"}
            icon={<IoBagHandleOutline size={20} />}
            onClick={() => navigate("/admin/products")}
          >
            {t("products")}
          </MenuItem>
          <MenuItem
            active={location.pathname === "/admin/categories"}
            icon={<IoGridOutline size={20} />}
            onClick={() => navigate("/admin/categories")}
          >
            {t("categories")}
          </MenuItem>
        </Menu>

        {/* Footer Actions (Switches & Logout) */}
        <div className="absolute bottom-5 w-full">
          <Menu menuItemStyles={menuItemStyles}>
            {/* Theme Toggle */}
            <MenuItem
              icon={
                theme === "light" ? (
                  <IoMoonOutline size={20} />
                ) : (
                  <IoSunnyOutline size={20} />
                )
              }
              onClick={toggleTheme}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </MenuItem>

            {/* Language Toggle */}
            <MenuItem
              icon={<IoLanguageOutline size={20} />}
              onClick={() => switchLanguage(language === "en" ? "bn" : "en")}
            >
              {language === "en" ? "বাংলা" : "English"}
            </MenuItem>

            <div className="my-2 border-t border-gray-100 dark:border-gray-800 mx-4"></div>

            <MenuItem
              icon={<IoHomeOutline size={20} />}
              onClick={() => navigate("/")}
            >
              {t("back_home")}
            </MenuItem>

            <MenuItem icon={<MdLogout size={20} />} onClick={logout}>
              {t("logout")}
            </MenuItem>
          </Menu>
        </div>
      </Sidebar>
    </div>
  );
};

export default SidePanel;
