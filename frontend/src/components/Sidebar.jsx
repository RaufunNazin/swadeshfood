/* eslint-disable no-unused-vars */
import React from "react";
import { slide as Menu } from "react-burger-menu";
import "../index.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Modal } from "antd";
import api from "../api";

const Sidebar = () => {
  const [user, setUser] = useState({});
  const nav = useNavigate();
  let location = useLocation();
  const [modal2Open, setModal2Open] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  const to = (address) => {
    setOpen(false);
    nav(`/${address}`);
  };

  const getProfile = () => {
    api
      .get("/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setUser(res.data);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
    setModal2Open(false);
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
    <div
      className={`${
        location.pathname === "/register" ||
        location.pathname === "/login" ||
        location.pathname === "/admin/categories" ||
        location.pathname === "/admin/images" ||
        location.pathname === "/admin/products" ||
        location.pathname === "/admin/orders" ||
        location.pathname === "*"
          ? "hideButton"
          : ""
      }`}
    >
      <Menu
        left
        isOpen={isOpen}
        onOpen={() => setOpen(!isOpen)}
        onClose={() => setOpen(!isOpen)}
      >
        <div className="block md:hidden">
          <input
            type="text"
            placeholder="Search Products"
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/search/${searchText}`);
              }
            }}
            className="w-full rounded-md border border-[#DED2D9] px-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        {user?.role === 1 && (
          <div onClick={() => to("admin/products")} className="menu-item">
            Admin Panel
          </div>
        )}
        <div onClick={() => to("store")} className="menu-item">
          Store
        </div>
        <div onClick={() => to("new")} className="menu-item">
          New Arrivals
        </div>
        <div onClick={() => to("connect")} className="menu-item">
          Connect
        </div>
        {isLoggedIn ? (
          <div onClick={() => to(`profile/${user.id}`)} className="menu-item">
            Profile
          </div>
        ) : (
          <div onClick={() => to("login")} className="menu-item">
            Login
          </div>
        )}

        {isLoggedIn && (
          <li>
            <div
              onClick={() => {
                setModal2Open(true);
                setOpen(false);
              }}
              className="menu-item"
            >
              Logout
            </div>
          </li>
        )}
        <Modal
          title="Confirmation"
          centered
          open={modal2Open}
          okText={"Log out"}
          onOk={logout}
          onCancel={() => setModal2Open(false)}
        >
          <div>Are you sure you want to log out?</div>
        </Modal>
      </Menu>
    </div>
  );
};

export default Sidebar;
