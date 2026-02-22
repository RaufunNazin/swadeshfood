/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react"; // Added imports
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
import {
  Tooltip,
  Select,
  ConfigProvider,
  theme as antdTheme,
  Spin,
} from "antd"; // Added Spin
import PropTypes from "prop-types";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import debounce from "lodash.debounce";
import FreeDeliveryBar from "./FreeDeliveryBar";
import { useCart } from "../contexts/CartContext";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { cartCount, subtotal } = useCart();

  // --- Search States ---
  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);
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

  // --- NEW: Search Logic ---

  // 1. Function to call API
  const fetchSuggestions = async (value) => {
    setSearchValue(value);

    if (!value) {
      setOptions([]);
      return;
    }

    setFetching(true);
    try {
      const { data } = await api.get(
        `/search/suggestions/${encodeURIComponent(value)}`,
      );

      const newOptions = data.map((product) => ({
        // This is what the user sees in the dropdown
        label: (
          <div className="flex items-center gap-3 py-1">
            <img
              src={product.image1}
              alt=""
              className="w-10 h-10 object-cover rounded-md border border-neutral-200 dark:border-neutral-700"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-800 dark:text-neutral-100 truncate">
                  {product.name}
                </span>
                <span className="text-green-600 dark:text-green-400 font-bold ml-2">
                  ৳{product.price}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                <span
                  className={
                    product.stock > 0
                      ? "text-neutral-400"
                      : "text-red-500 font-bold"
                  }
                >
                  {product.stock > 0
                    ? `${t("stock")}: ${product.stock}`
                    : t("out_of_stock")}
                </span>
              </div>
            </div>
          </div>
        ),
        value: product.id,
        // Keep a string version for internal searching/accessibility
        searchValue: product.name,
      }));
      setOptions(newOptions);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setFetching(false);
    }
  };

  // 2. Debounce (Wait 500ms before calling API)
  const debounceFetcher = useMemo(() => {
    return debounce(fetchSuggestions, 500);
  }, []);

  // 3. Handle User Selection
  const handleSelect = (productId) => {
    // Navigate directly to the product page
    navigate(`/product/${productId}`);
    setSearchValue(null); // Clear search bar after selection
    setOptions([]); // Clear options
  };

  const navLinkClass = (path) => `
    text-sm font-semibold uppercase tracking-wider transition-all duration-300 relative group cursor-pointer
    ${
      isActive(path)
        ? "text-green-700 dark:text-green-400"
        : "text-neutral-500 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400"
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

  // ... (imports and logic remain the same) ...

  return (
    <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-100 dark:border-neutral-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <FreeDeliveryBar subtotal={subtotal} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {" "}
          {/* Changed to justify-between */}
          {/* --- LEFT SIDE (Mobile Logo / Desktop Links) --- */}
          {/* Logo (Mobile & Desktop) */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="Swadesh Food"
              className="h-8 md:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
            />
            {/* Optional: Add Brand Name text for mobile if desired, or leave just logo */}
          </div>
          {/* Desktop Nav Links (Hidden on Mobile) */}
          <div className="hidden md:flex space-x-10 items-center ml-8 mr-auto">
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
          {/* --- RIGHT SIDE (Actions, Cart, Burger Menu) --- */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            {/* Search (Desktop Only) */}
            <div className="hidden lg:block w-64 relative">
              <ConfigProvider
                theme={{
                  algorithm:
                    theme === "dark"
                      ? antdTheme.darkAlgorithm
                      : antdTheme.defaultAlgorithm,
                  token: {
                    borderRadius: 20,
                  },
                }}
              >
                <Select
                  showSearch
                  placeholder={t("search_placeholder")}
                  optionLabelProp="searchValue"
                  defaultActiveFirstOption={false}
                  suffixIcon={
                    <RiSearchLine className="text-neutral-400 text-lg" />
                  }
                  filterOption={false}
                  onSearch={debounceFetcher}
                  onChange={handleSelect}
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  options={options}
                  className="w-full"
                  size="large"
                  variant="filled"
                  value={searchValue}
                  dropdownStyle={{ minWidth: "300px" }}
                />
              </ConfigProvider>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-1 sm:space-x-3 md:border-l md:pl-5 border-neutral-200 dark:border-neutral-700 h-8">
              {/* Language Switcher (Hidden on small mobile to save space, available in sidebar) */}
              <button
                onClick={() => switchLanguage(language === "en" ? "bn" : "en")}
                className="hidden sm:flex text-neutral-500 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 p-1.5 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-xs font-bold flex-col items-center leading-none"
                title="Switch Language"
              >
                <span className={language === "en" ? "text-green-600" : ""}>
                  EN
                </span>
                <span className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-600 my-[1px]"></span>
                <span className={language === "bn" ? "text-green-600" : ""}>
                  BN
                </span>
              </button>

              {/* Theme Toggle (Hidden on small mobile, available in sidebar) */}
              <button
                onClick={toggleTheme}
                className="hidden sm:block text-neutral-500 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 p-1.5 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {theme === "light" ? (
                  <RiMoonLine className="text-xl" />
                ) : (
                  <RiSunLine className="text-xl" />
                )}
              </button>

              {/* User Icon (Desktop Only) */}
              <button
                onClick={() =>
                  navigate(isLoggedIn ? `/profile/${user.id}` : "/login")
                }
                className="hidden md:block text-neutral-500 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 transition-colors p-1 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800"
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

              {/* Cart (Visible everywhere) */}
              <button
                id="global-cart-icon"
                onClick={() => navigate("/cart")}
                className="relative text-neutral-600 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 transition-colors p-1 sm:p-2 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <Tooltip title="Cart">
                  <RiShoppingCartLine className="text-2xl sm:text-3xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] sm:text-xs font-bold h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900">
                      {cartCount}
                    </span>
                  )}
                </Tooltip>
              </button>

              {/* Mobile Menu Button (Moved to Right) */}
              <button
                className="md:hidden p-1 sm:p-2 ml-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                onClick={onMenuClick}
              >
                <RiMenu4Line className="text-2xl sm:text-3xl" />
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
