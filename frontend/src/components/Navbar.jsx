import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  RiShoppingCartLine,
  RiSearchLine,
  RiMenu4Line,
  RiSunLine,
  RiMoonLine,
} from "react-icons/ri";
import { FiUser, FiLogIn } from "react-icons/fi";
import api from "../api";
// 1. Import ConfigProvider and theme from antd
import { Tooltip, Select, ConfigProvider, theme as antdTheme } from "antd";
import PropTypes from "prop-types";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchValue, setSearchValue] = useState(null);

  // Contexts
  const { theme, toggleTheme } = useTheme();
  const { language, switchLanguage, t } = useLanguage();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getProfile = () => {
    api
      .get("/me")
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data);
          setIsLoggedIn(true);
        }
      })
      .catch(() => setIsLoggedIn(false));
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleSearch = (value) => {
    if (value) navigate(`/search/${value}`);
  };

  const navLinkClass = (path) => `
    text-sm font-semibold uppercase tracking-wider transition-all duration-300 relative group cursor-pointer
    ${
      isActive(path)
        ? "text-green-700 dark:text-green-400"
        : "text-gray-500 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
    }
  `;

  const Underline = ({ path }) => (
    <span
      className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 dark:bg-green-400 transition-all duration-300 ${isActive(path) ? "w-full" : "w-0 group-hover:w-full"}`}
    ></span>
  );

  Underline.propTypes = {
    path: PropTypes.string.isRequired,
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-20">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={onMenuClick}
          >
            <RiMenu4Line className="text-2xl" />
          </button>

          {/* Logo */}
          <div
            className="md:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            onClick={() => navigate("/")}
          >
            <img src="/logo.png" alt="Swadesh Food" className="h-8 w-auto" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-10 items-center mr-auto">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer mr-8"
              onClick={() => navigate("/")}
            >
              <img
                src="/logo.png"
                alt="Swadesh Food"
                className="h-10 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </div>
            <div onClick={() => navigate("/")} className={navLinkClass("/")}>
              {t("home")} <Underline path="/" />
            </div>
            <div
              onClick={() => navigate("/store")}
              className={navLinkClass("/store")}
            >
              {t("store")} <Underline path="/store" />
            </div>
            <div
              onClick={() => navigate("/new")}
              className={navLinkClass("/new")}
            >
              {t("new")} <Underline path="/new" />
            </div>
            <div
              onClick={() => navigate("/connect")}
              className={navLinkClass("/connect")}
            >
              {t("connect")} <Underline path="/connect" />
            </div>
            {user.role === 1 && (
              <div
                onClick={() => navigate("/admin/dashboard")}
                className={navLinkClass("/admin")}
              >
                {t("admin")} <Underline path="/admin" />
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Search */}
            <div className="hidden lg:block w-64 relative">
              {/* 2. Wrap Select in ConfigProvider to apply Dark Algorithm */}
              <ConfigProvider
                theme={{
                  algorithm:
                    theme === "dark"
                      ? antdTheme.darkAlgorithm
                      : antdTheme.defaultAlgorithm,
                  token: {
                    borderRadius: 20, // Optional: Match your rounded style
                    // You can customize colors further here if needed
                  },
                }}
              >
                <Select
                  showSearch
                  placeholder={t("search_placeholder")}
                  defaultActiveFirstOption={false}
                  suffixIcon={
                    <RiSearchLine className="text-gray-400 text-lg" />
                  }
                  filterOption={false}
                  onSearch={(val) => setSearchValue(val)}
                  onSelect={handleSearch}
                  onInputKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(searchValue);
                  }}
                  notFoundContent={null}
                  className="w-full"
                  size="large"
                  variant="filled"
                  // Removed manual style borderRadius here, handled in theme token or className
                />
              </ConfigProvider>
            </div>

            {/* Controls & Cart */}
            <div className="flex items-center space-x-2 md:space-x-3 md:border-l md:pl-5 border-gray-200 dark:border-gray-700 h-8">
              {/* Language Switcher */}
              <button
                onClick={() => switchLanguage(language === "en" ? "bn" : "en")}
                className="text-gray-500 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs font-bold flex flex-col items-center leading-none"
                title="Switch Language"
              >
                <span className={language === "en" ? "text-green-600" : ""}>
                  EN
                </span>
                <span className="w-full h-[1px] bg-gray-300 dark:bg-gray-600 my-[1px]"></span>
                <span className={language === "bn" ? "text-green-600" : ""}>
                  BN
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "light" ? (
                  <RiMoonLine className="text-xl" />
                ) : (
                  <RiSunLine className="text-xl" />
                )}
              </button>

              {/* User Icon */}
              <button
                onClick={() =>
                  navigate(isLoggedIn ? `/profile/${user.id}` : "/login")
                }
                className="text-gray-500 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hidden md:block"
              >
                {isLoggedIn ? (
                  <Tooltip title={t("profile")}>
                    {" "}
                    <FiUser className="text-2xl" />{" "}
                  </Tooltip>
                ) : (
                  <Tooltip title={t("login")}>
                    {" "}
                    <FiLogIn className="text-2xl" />{" "}
                  </Tooltip>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="relative text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Tooltip title="Cart">
                  <RiShoppingCartLine className="text-2xl" />
                  {JSON.parse(localStorage.getItem("cart"))?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                      {JSON.parse(localStorage.getItem("cart")).length}
                    </span>
                  )}
                </Tooltip>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  onMenuClick: PropTypes.func,
};

export default Navbar;
