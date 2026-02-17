import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiShoppingCartLine, RiSearchLine, RiMenu4Line } from "react-icons/ri"; // Added Menu Icon
import { FiUser, FiLogIn } from "react-icons/fi";
import api from "../api";
import { Tooltip, Select } from "antd";
import PropTypes from "prop-types";

const Navbar = ({ onMenuClick }) => {
  // Accept prop here
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchValue, setSearchValue] = useState(null);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getProfile = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    api
      .get("/me", { headers: { Authorization: `Bearer ${token}` } })
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
    ${isActive(path) ? "text-green-700" : "text-gray-500 hover:text-green-700"}
  `;

  const Underline = ({ path }) => (
    <span
      className={`absolute -bottom-1 left-0 h-0.5 bg-green-600 transition-all duration-300 ${isActive(path) ? "w-full" : "w-0 group-hover:w-full"}`}
    ></span>
  );

  Underline.propTypes = {
    path: PropTypes.string.isRequired,
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-20">
          {/* --- Mobile: Hamburger (Left) --- */}
          <button
            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onMenuClick} // Trigger open
          >
            <RiMenu4Line className="text-2xl" />
          </button>

          {/* --- Mobile: Centered Logo --- */}
          <div
            className="md:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            onClick={() => navigate("/")}
          >
            <img src="/logo.png" alt="Swadesh Food" className="h-8 w-auto" />
          </div>

          {/* --- Desktop: Navigation (Left/Center) --- */}
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
              Home <Underline path="/" />
            </div>
            <div
              onClick={() => navigate("/store")}
              className={navLinkClass("/store")}
            >
              Store <Underline path="/store" />
            </div>
            <div
              onClick={() => navigate("/new")}
              className={navLinkClass("/new")}
            >
              New <Underline path="/new" />
            </div>
            <div
              onClick={() => navigate("/connect")}
              className={navLinkClass("/connect")}
            >
              Connect <Underline path="/connect" />
            </div>
            {user.role === 1 && (
              <div
                onClick={() => navigate("/admin/dashboard")}
                className={navLinkClass("/admin")}
              >
                Admin <Underline path="/admin" />
              </div>
            )}
          </div>

          {/* --- Right Actions --- */}
          <div className="flex items-center space-x-5 ml-auto">
            <div className="hidden lg:block w-64 relative">
              <Select
                showSearch
                placeholder="Search essentials..."
                defaultActiveFirstOption={false}
                suffixIcon={<RiSearchLine className="text-gray-400 text-lg" />}
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
                style={{ borderRadius: "99px" }}
              />
            </div>
            <div className="flex items-center space-x-3 md:space-x-4 md:border-l md:pl-5 border-gray-200 h-8">
              <button
                onClick={() =>
                  navigate(isLoggedIn ? `/profile/${user.id}` : "/login")
                }
                className="text-gray-500 hover:text-green-700 transition-colors p-1 rounded-full hover:bg-gray-50 hidden md:block"
              >
                {isLoggedIn ? (
                  <Tooltip title="Profile">
                    <FiUser className="text-2xl" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Login">
                    <FiLogIn className="text-2xl" />
                  </Tooltip>
                )}
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="relative text-gray-600 hover:text-green-700 transition-colors p-1 rounded-full hover:bg-gray-50"
              >
                <Tooltip title="Cart">
                  <RiShoppingCartLine className="text-2xl" />
                  {JSON.parse(localStorage.getItem("cart"))?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
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
