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

  // useEffect(() => {
  //   api
  //     .get("/me")
  //     .then((res) => {
  //       if (res.data.role !== 1) navigate("/");
  //       setUser(res.data);
  //     })
  //     .catch(() => navigate("/login"));
  // }, [navigate]);

  const menuItemStyles = {
    button: ({ active }) => ({
      backgroundColor: active
        ? theme === "dark"
          ? "#1e293b" // slate-800
          : "#eff6ff" // blue-50
        : undefined,
      color: active
        ? "#2563eb" // blue-600
        : theme === "dark"
          ? "#d1d5db"
          : "#4b5563",
      borderRight: active ? "3px solid #2563eb" : "none", // Blue highlight bar
      "&:hover": {
        backgroundColor: theme === "dark" ? "#1e293b" : "#eff6ff",
        color: "#2563eb",
      },
    }),
  };

  return (
    <div className="h-[calc(100vh-40px)] sticky top-5 ml-5 my-5 bg-white dark:bg-neutral-900 shadow-sm z-20 border border-neutral-100 dark:border-neutral-800 transition-colors duration-300 rounded-3xl overflow-hidden flex flex-col">
      <Sidebar
        collapsed={collapsed}
        backgroundColor={theme === "dark" ? "#171717" : "#ffffff"}
        className="h-full border-none"
      >
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`px-7 py-5 flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && (
            <span className="font-mono text-xl text-brand dark:text-green-400">
              {user.username || "Admin"}
            </span>
          )}
          <div className="p-1 rounded text-neutral-600 dark:text-neutral-300">
            <IoChevronForwardOutline
              className={`transition-transform duration-300 ${
                collapsed ? "rotate-0" : "rotate-180"
              }`}
            />
          </div>
        </button>

        {/* Menu Items */}
        <Menu menuItemStyles={menuItemStyles} className="mt-4">
          <MenuItem
            active={location.pathname === "/admin/dashboard"}
            icon={<MdDashboard size={20} />}
            onClick={() => navigate("/admin/dashboard")}
          >
            {t("dashboard")}
          </MenuItem>

          <div className="px-6 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-4">
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
              {theme === "light" ? t("dark_mode") : t("light_mode")}
            </MenuItem>

            {/* Language Toggle */}
            <MenuItem
              icon={<IoLanguageOutline size={20} />}
              onClick={() => switchLanguage(language === "en" ? "bn" : "en")}
            >
              {language === "en" ? "বাংলা" : "English"}
            </MenuItem>

            <div className="my-2 border-t border-neutral-100 dark:border-neutral-800 mx-4"></div>

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
