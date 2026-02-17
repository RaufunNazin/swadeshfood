/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { slide as Menu } from "react-burger-menu";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import api from "../api";
import {
  RiHomeLine,
  RiStoreLine,
  RiFlashlightLine,
  RiContactsLine,
  RiDashboardLine,
  RiUserLine,
  RiLogoutBoxLine,
  RiSearchLine,
  RiLoginCircleLine,
  RiArrowRightSLine,
  RiCloseLine, // Import the close icon
} from "react-icons/ri";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      api
        .get("/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data))
        .catch(() => setIsLoggedIn(false));
    } else {
      setIsLoggedIn(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (onClose && typeof onClose === "function") {
      onClose();
    }
  };

  const handleNavigation = (path) => {
    handleClose();
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setModalOpen(false);
    handleClose();
    setIsLoggedIn(false);
  };

  return (
    <>
      <Menu
        left
        isOpen={isOpen}
        onStateChange={(state) => !state.isOpen && handleClose()}
        customBurgerIcon={false}
        // FIX: Added the actual Icon inside the div
        customCrossIcon={
          <div className="bg-gray-100 p-1 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
            <RiCloseLine size={24} />
          </div>
        }
        width={"85%"}
        className="md:hidden"
        noOverlay={false}
      >
        {/* --- Header Profile Section --- */}
        <div className="px-6 pt-10 pb-6 border-b border-gray-100 bg-white">
          {isLoggedIn ? (
            <div
              className="flex items-center gap-4"
              onClick={() => handleNavigation(`/profile/${user.id}`)}
            >
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-xl font-bold border border-green-200">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-lg truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <RiArrowRightSLine className="text-gray-400" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="logo" className="h-10 w-auto" />
              <span className="font-bold text-gray-800 text-lg">
                Swadesh Food
              </span>
            </div>
          )}
        </div>

        {/* --- Search Bar --- */}
        <div className="px-6 py-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNavigation(`/search/${searchText}`);
                  setSearchText("");
                }
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border-none focus:ring-2 focus:ring-green-100 outline-none text-sm transition-all"
            />
            <RiSearchLine className="absolute left-3 top-3.5 text-gray-400 text-lg" />
          </div>
        </div>

        {/* --- Menu Links --- */}
        <div className="flex flex-col px-4 gap-1 pb-10">
          {user?.role === 1 && (
            <NavItem
              icon={RiDashboardLine}
              label="Admin Panel"
              onClick={() => handleNavigation("/admin/dashboard")}
            />
          )}

          <NavItem
            icon={RiHomeLine}
            label="Home"
            onClick={() => handleNavigation("/")}
          />
          <NavItem
            icon={RiStoreLine}
            label="Store"
            onClick={() => handleNavigation("/store")}
          />
          <NavItem
            icon={RiFlashlightLine}
            label="New Arrivals"
            onClick={() => handleNavigation("/new")}
          />
          <NavItem
            icon={RiContactsLine}
            label="Connect"
            onClick={() => handleNavigation("/connect")}
          />

          <div className="my-4 border-t border-gray-100 mx-2"></div>

          {isLoggedIn ? (
            <>
              <NavItem
                icon={RiUserLine}
                label="My Profile"
                onClick={() => handleNavigation(`/profile/${user.id}`)}
              />
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-4 w-full p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
              >
                <RiLogoutBoxLine className="text-xl" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <NavItem
              icon={RiLoginCircleLine}
              label="Login / Register"
              onClick={() => handleNavigation("/login")}
              highlight
            />
          )}
        </div>
      </Menu>

      <Modal
        title="Sign Out"
        centered
        open={modalOpen}
        onOk={logout}
        okText="Log Out"
        okButtonProps={{ danger: true }}
        onCancel={() => setModalOpen(false)}
        zIndex={10001}
      >
        <p>Are you sure you want to sign out of your account?</p>
      </Modal>
    </>
  );
};

const NavItem = ({ icon: Icon, label, onClick, highlight = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-base
        ${
          highlight
            ? "bg-green-600 text-white shadow-lg hover:bg-green-700"
            : "text-gray-600 hover:bg-green-50 hover:text-green-700"
        }`}
  >
    <Icon
      className={`text-xl ${highlight ? "text-white" : "text-gray-400 group-hover:text-green-600"}`}
    />
    <span>{label}</span>
  </button>
);

export default Sidebar;
