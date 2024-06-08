import { LiaFacebook } from "react-icons/lia";
import { IoLogoWhatsapp } from "react-icons/io5";
import { AiOutlineYoutube } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useEffect, useState } from "react";

const Footer = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const copy = (text) => {
    try {
      toast.success("Copied to clipboard");
      navigator.clipboard.writeText(text);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };
  const getProfile = () => {
    api
      .get("/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setIsLoggedIn(true);
        }
      })
      .catch((err) => {
        setIsLoggedIn(false);
        console.log(err);
      });
  };
  useEffect(() => {
    getProfile();
  }, []);
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        draggable={true}
        pauseOnHover={false}
        theme="colored"
      />
      <div className="flex flex-col gap-y-8 lg:gap-y-16 px-2 lg:px-48 bg-accent py-8 lg:py-16">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex flex-col gap-y-5 justify-center">
            <button onClick={() => navigate("/")}>
              <img src="/logo.png" alt="logo" className="h-12 lg:h-20" />
            </button>
            <div className="flex justify-center items-center gap-x-3 lg:gap-x-6">
              <a href="https://www.facebook.com/snapgenix" target="_blank">
                <button>
                  <LiaFacebook className="text-[16px] lg:text-[25px] text-xdark hover:text-brand transition-all duration-150" />
                </button>
              </a>

              <a
                href="https://api.whatsapp.com/send?phone=%2B8801701665394"
                target="_blank"
              >
                <button>
                  <IoLogoWhatsapp className="text-[14px] lg:text-[21px] text-xdark hover:text-brand transition-all duration-150" />
                </button>
              </a>

              <a href="https://www.youtube.com/@SnapGenix" target="_blank">
                <button>
                  <AiOutlineYoutube className="text-[17px] lg:text-[27px] text-xdark hover:text-brand transition-all duration-150" />
                </button>
              </a>
            </div>
          </div>
          <div className="flex lg:flex-col gap-4 items-start">
            <button
              onClick={() => navigate("/store")}
              className="text-[12px] lg:text-[16px] font-light text-xdark hover:text-brand transition-all duration-150"
            >
              Store
            </button>
            <button
              onClick={() => navigate("/new")}
              className="text-[12px] lg:text-[16px] font-light text-xdark hover:text-brand transition-all duration-150"
            >
              New Arrival
            </button>
            <button
              onClick={() => navigate("/new")}
              className="text-[12px] lg:text-[16px] font-light text-xdark hover:text-brand transition-all duration-150"
            >
              Favorites
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/profile")}
                className="text-[12px] lg:text-[16px] font-light text-xdark hover:text-brand transition-all duration-150"
              >
                Profile
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-[12px] lg:text-[16px] font-light text-xdark hover:text-brand transition-all duration-150"
              >
                Login
              </button>
            )}
          </div>
          <div className="flex lg:flex-col gap-y-4 justify-between w-full lg:w-fit items-start">
            <Tooltip title="Click to copy" color={"#d21820"} key={"phone"}>
              <button
                onClick={() => copy("number goes here")}
                className="text-[12px] lg:text-[16px] font-light text-xdark"
              >
                Call us: number goes here
              </button>
            </Tooltip>

            <Tooltip title="Click to copy" color={"#d21820"} key={"mail"}>
              <button
                onClick={() => copy("email goes here")}
                className="text-[12px] lg:text-[16px] font-light text-xdark"
              >
                Email us: email goes here
              </button>
            </Tooltip>
          </div>
          <Tooltip title="Click to view" color={"#d21820"} key={"location"}>
            <a
              href="https://www.google.com/maps/search/Road+4,+Block+J,+Banasree,+Dhaka,+Bangladesh/@23.7747992,90.353354,13z/data=!3m1!4b1?entry=ttu"
              target="_blank"
              className="text-[12px] lg:text-[16px] font-light text-xdark w-full text-center lg:text-left lg:w-fit"
            >
              Find us: location goes here
            </a>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-y-2 lg:gap-y-6 items-center">
          <div className="text-[12px] lg:text-[16px] font-light text-xdark">
            Copyright © 2024 Swadesh Food. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
