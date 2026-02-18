/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { slide as Menu } from "react-burger-menu";
import { useNavigate } from "react-router-dom";
import { Modal, Switch } from "antd"; // Import Switch
import api from "../api";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
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
  RiCloseLine,
  RiMoonLine,
  RiSunLine,
  RiTranslate2,
} from "react-icons/ri";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Contexts
  const { theme, toggleTheme } = useTheme();
  const { language, switchLanguage, t } = useLanguage();

  useEffect(() => {
    api
      .get("/me")
      .then((res) => {
        setUser(res.data);
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
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
    api
      .post("/logout")
      .then(() => navigate("/login"))
      .catch(() => navigate("/login"));
  };

  return (
    <>
      <Menu
        left
        isOpen={isOpen}
        onStateChange={(state) => !state.isOpen && handleClose()}
        customBurgerIcon={false}
        customCrossIcon={
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full text-gray-500 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all">
            <RiCloseLine size={24} />
          </div>
        }
        width={"85%"}
        className="md:hidden bg-white dark:bg-gray-900" // Dark mode bg
        noOverlay={false}
      >
        {/* --- Header Profile Section --- */}
        <div className="px-6 pt-10 pb-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          {isLoggedIn ? (
            <div
              className="flex items-center gap-4"
              onClick={() => handleNavigation(`/profile/${user.id}`)}
            >
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-xl font-bold border border-green-200 dark:border-green-800">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold text-gray-900 dark:text-white text-lg truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
              <RiArrowRightSLine className="text-gray-400" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="logo" className="h-10 w-auto" />
              <span className="font-bold text-gray-800 dark:text-white text-lg">
                Swadesh Food
              </span>
            </div>
          )}
        </div>

        {/* --- Search Bar --- */}
        <div className="px-6 py-6 bg-white dark:bg-gray-900">
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNavigation(`/search/${searchText}`);
                  setSearchText("");
                }
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 border-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 outline-none text-sm transition-all"
            />
            <RiSearchLine className="absolute left-3 top-3.5 text-gray-400 text-lg" />
          </div>
        </div>

        {/* --- Menu Links --- */}
        <div className="flex flex-col px-4 gap-1 pb-4 bg-white dark:bg-gray-900">
          {user?.role === 1 && (
            <NavItem
              icon={RiDashboardLine}
              label={t("admin")}
              onClick={() => handleNavigation("/admin/dashboard")}
            />
          )}

          <NavItem
            icon={RiHomeLine}
            label={t("home")}
            onClick={() => handleNavigation("/")}
          />
          <NavItem
            icon={RiStoreLine}
            label={t("store")}
            onClick={() => handleNavigation("/store")}
          />
          <NavItem
            icon={RiFlashlightLine}
            label={t("new")}
            onClick={() => handleNavigation("/new")}
          />
          <NavItem
            icon={RiContactsLine}
            label={t("connect")}
            onClick={() => handleNavigation("/connect")}
          />

          <div className="my-4 border-t border-gray-100 dark:border-gray-800 mx-2"></div>

          {/* --- Settings (Theme & Lang) --- */}
          <div className="px-3.5 py-2">
            <div className="flex justify-between items-center mb-4">
              <span className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
                {theme === "light" ? (
                  <RiSunLine className="text-xl" />
                ) : (
                  <RiMoonLine className="text-xl" />
                )}
                Dark Mode
              </span>
              <Switch
                checked={theme === "dark"}
                onChange={toggleTheme}
                className="bg-gray-300"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
                <RiTranslate2 className="text-xl" />
                Bangla
              </span>
              <Switch
                checked={language === "bn"}
                onChange={(checked) => switchLanguage(checked ? "bn" : "en")}
                className="bg-gray-300"
              />
            </div>
          </div>

          <div className="my-4 border-t border-gray-100 dark:border-gray-800 mx-2"></div>

          {isLoggedIn ? (
            <>
              <NavItem
                icon={RiUserLine}
                label={t("profile")}
                onClick={() => handleNavigation(`/profile/${user.id}`)}
              />
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-4 w-full p-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
              >
                <RiLogoutBoxLine className="text-xl" />
                <span>{t("logout")}</span>
              </button>
            </>
          ) : (
            <NavItem
              icon={RiLoginCircleLine}
              label={t("login")}
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
        okText={t("logout")}
        okButtonProps={{ danger: true }}
        onCancel={() => setModalOpen(false)}
        zIndex={10001}
      >
        <p>Are you sure you want to sign out?</p>
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
            : "text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 dark:hover:text-green-400"
        }`}
  >
    <Icon
      className={`text-xl ${highlight ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-green-600"}`}
    />
    <span>{label}</span>
  </button>
);

export default Sidebar;
