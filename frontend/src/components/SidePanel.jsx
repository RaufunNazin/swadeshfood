import { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { IoChevronForwardOutline } from "react-icons/io5";
import { IoBagAddOutline } from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import { BiCategoryAlt } from "react-icons/bi";
import {
  MdLogout,
  MdLogin,
  MdOutlinePhoto,
  MdCalendarMonth,
} from "react-icons/md";
import api from "../api";

const SidePanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    window?.screen?.width < 768 ? true : false
  );
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { state: "logout" });
  };

  const getProfile = () => {
    api
      .get("/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.data.role !== 1) {
          navigate("/", { state: "unauthorized" });
        }
        setUser(res.data);
      });
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    getProfile();
  }, []);

  return (
    <div className="sticky top-0 h-screen lg:block">
      <Sidebar collapsed={collapsed} className="h-full">
        <Menu>
          <MenuItem
            icon={
              <IoChevronForwardOutline
                className={`transition-all duration-300 ${
                  collapsed ? "rotate-0" : "rotate-180"
                }`}
              />
            }
            onClick={() => {
              setCollapsed(!collapsed);
            }}
            className="py-3"
          >
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="text-lg font-semibold text-xdark"
              >
                Swadesh Food
              </button>
              <div
                className={`flex transition-all duration-300 justify-${
                  collapsed ? "center" : "end"
                } flex-1`}
              ></div>
            </div>
          </MenuItem>
          <hr />
          {collapsed ? (
            <FiUser className="text-md my-3 w-full text-center text-xgray" />
          ) : (
            <div>
              <div className="ml-5 mt-3 flex items-center gap-x-2">
                <FiUser className="text-md text-xgray" />
                <div className="text-md font-medium text-xgray">
                  {user.username || "admin"}
                </div>
              </div>
              <div className="mb-3 ml-5 text-xs font-thin text-xlightgray">
                {user.role === 1 ? "System Admin" : "Customer"}
              </div>
            </div>
          )}
          <hr />
          {!collapsed && (
            <div className="text-sm ml-5 mt-7 font-light text-xlightgray">
              Product Management
            </div>
          )}
          <div
            className={`w-full ${
              location.pathname === "/admin/products" ? "bg-red-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/products")
                navigate("/admin/products");
            }}
          >
            <MenuItem icon={<IoBagAddOutline className="text-xgray" />}>
              <div className="font-medium text-xgray">Products</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/admin/images" ? "bg-red-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/images")
                navigate("/admin/images");
            }}
          >
            <MenuItem icon={<MdOutlinePhoto className="text-xgray" />}>
              <div className="font-medium text-xgray">Add Images</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/admin/categories" ? "bg-red-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/categories")
                navigate("/admin/categories");
            }}
          >
            <MenuItem icon={<BiCategoryAlt className="text-xgray" />}>
              <div className="font-medium text-xgray">Categories</div>
            </MenuItem>
          </div>
          {!collapsed && (
            <div className="text-sm ml-5 mt-7 font-light text-xlightgray">
              Order Management
            </div>
          )}
          <div
            className={`w-full ${
              location.pathname === "/admin/orders" ? "bg-red-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/orders")
                navigate("/admin/orders");
            }}
          >
            <MenuItem icon={<MdCalendarMonth className="text-xgray" />}>
              <div className="font-medium text-xgray">Orders</div>
            </MenuItem>
          </div>
          {isLoggedIn ? (
            <div className={`absolute bottom-0 w-full`} onClick={logout}>
              <hr />
              <MenuItem
                icon={<MdLogout className="text-xgray" />}
                className="py-3"
              >
                <div className="font-medium text-xgray">Logout</div>
              </MenuItem>
            </div>
          ) : (
            <div
              className={`absolute bottom-0 w-full`}
              onClick={() => navigate("/login")}
            >
              <hr />
              <MenuItem
                icon={<MdLogin className="text-xgray" />}
                className="py-3"
              >
                <div className="font-medium text-xgray">Login</div>
              </MenuItem>
            </div>
          )}
        </Menu>
      </Sidebar>
    </div>
  );
};

export default SidePanel;
