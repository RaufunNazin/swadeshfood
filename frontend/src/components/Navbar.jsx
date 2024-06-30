import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdFavoriteBorder } from "react-icons/md";
import { RiShoppingCartLine } from "react-icons/ri";
import { FiUser, FiLogIn } from "react-icons/fi";
import api from "../api";
import { Tooltip } from "antd";

const Navbar = ({ active }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const getProfile = () => {
    api
      .get("/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data);
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  };
  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="bg-accent py-2 lg:py-0">
      <div className="flex justify-between items-center px-3 lg:px-32 lg:py-3">
        <div className="flex md:hidden flex-1 justify-start gap-x-5"></div>
        <div className="hidden md:flex flex-1 justify-start gap-x-5">
          <button
            onClick={() => navigate("/")}
            className={`${
              active === "home"
                ? "text-brand underline underline-offset-2"
                : "text-xdark"
            } text-sm hover:text-brand transition-all duration-200 hover:underline hover:underline-offset-2 font-semibold uppercase`}
          >
            home
          </button>
          <button
            onClick={() => navigate("/store")}
            className={`${
              active === "store"
                ? "text-brand underline underline-offset-2"
                : "text-xdark"
            } text-sm hover:text-brand transition-all duration-200 hover:underline hover:underline-offset-2 font-semibold uppercase`}
          >
            store
          </button>
          <button
            onClick={() => navigate("/new")}
            className={`${
              active === "new"
                ? "text-brand underline underline-offset-2"
                : "text-xdark"
            } text-sm hover:text-brand transition-all duration-200 hover:underline hover:underline-offset-2 font-semibold uppercase`}
          >
            new arrivals
          </button>
          <button
            onClick={() => navigate("/connect")}
            className={`${
              active === "connect"
                ? "text-brand underline underline-offset-2"
                : "text-xdark"
            } text-sm hover:text-brand transition-all duration-200 hover:underline hover:underline-offset-2 font-semibold uppercase`}
          >
            connect
          </button>
          {user.role === 1 && (
            <button
              onClick={() => navigate("/admin/products")}
              className={`${
                active === "admin"
                  ? "text-brand underline underline-offset-2"
                  : "text-xdark"
              } text-sm hover:text-brand transition-all duration-200 hover:underline hover:underline-offset-2 font-semibold uppercase`}
            >
              Admin Panel
            </button>
          )}
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex-1 flex justify-center"
        >
          <img src="/logo.png" alt="logo" className="h-12" />
        </button>
        <div className="flex flex-1 justify-end items-center gap-x-5">
          <div className="hidden md:block relative overflow-visible">
            <input
              type="text"
              placeholder="Search Products"
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/search/${searchText}`);
                }
              }}
              className="w-52 rounded-md border border-[#DED2D9] px-2 py-0.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {user && (
            <button
              onClick={() => {
                if (isLoggedIn) {
                  navigate(`/profile/${user.id}`);
                } else {
                  navigate("/login");
                }
              }}
            >
              {isLoggedIn ? (
                <Tooltip title="Profile" color={"#026839"} key={"profile"}>
                  <FiUser className="text-brand text-2xl" />
                </Tooltip>
              ) : (
                <Tooltip title="Login" color={"#026839"} key={"login"}>
                  <FiLogIn className="text-brand text-2xl" />
                </Tooltip>
              )}
            </button>
          )}
          <button onClick={() => navigate("/cart")} className="relative">
            <Tooltip title="Cart" color={"#026839"} key={"cart"}>
              <div className="absolute -top-1 -right-2 bg-brand text-white rounded-full text-[10px] h-4 w-4">
                {JSON.parse(localStorage.getItem("cart"))?.length}
              </div>
              <RiShoppingCartLine className="text-brand text-2xl" />
            </Tooltip>
          </button>
        </div>
      </div>
      <hr className="bg-xlightgray h-0.5 hidden md:block" />
    </div>
  );
};

export default Navbar;
