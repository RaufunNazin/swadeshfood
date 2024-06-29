import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useEffect, useState } from "react";

const   Footer = () => {
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
      .catch(() => {
        setIsLoggedIn(false);
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
      <div className="flex flex-col gap-y-8 lg:gap-y-16 px-2 lg:px-48 bg-brand py-8 lg:py-16">
        <div className="flex w-4/5 mx-auto lg:mx-0 lg:w-full flex-col lg:flex-row flex-wrap justify-evenly lg:justify-between items-start gap-4">
          <div className="flex flex-col gap-y-5 justify-center">
            <button onClick={() => navigate("/")}>
              <img src="/logo.png" alt="logo" className="lg:h-20" />
            </button>
            {/* <div className="flex justify-center items-center gap-x-3 lg:gap-x-6">
              <a href="https://www.facebook.com/snapgenix" target="_blank">
                <button>
                  <LiaFacebook className="text-[16px] lg:text-[30px] text-white hover:text-brand transition-all duration-150" />
                </button>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=%2B8801701665394"
                target="_blank"
              >
                <button>
                  <IoLogoWhatsapp className="text-[14px] lg:text-[24px] text-white hover:text-brand transition-all duration-150" />
                </button>
              </a>
              <a href="https://www.youtube.com/@SnapGenix" target="_blank">
                <button>
                  <AiOutlineYoutube className="text-[17px] lg:text-[32px] text-white hover:text-brand transition-all duration-150" />
                </button>
              </a>
            </div> */}
          </div>
          <hr className="block lg:hidden border border-xyellow w-full" />
          <div className="lg:flex grid grid-cols-2 w-full lg:w-fit mx-auto lg:mx-0 lg:flex-col gap-4 items-start">
            <button
              onClick={() => navigate("/store")}
              className="text-[12px] lg:text-[16px] text-start font-light text-white hover:text-brand transition-all duration-150"
            >
              Store
            </button>
            <button
              onClick={() => navigate("/new")}
              className="text-[12px] lg:text-[16px] text-start font-light text-white hover:text-brand transition-all duration-150"
            >
              New Arrivals
            </button>
            <button
              onClick={() => navigate("/new")}
              className="text-[12px] lg:text-[16px] text-start font-light text-white hover:text-brand transition-all duration-150"
            >
              Connect
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/profile")}
                className="text-[12px] lg:text-[16px] text-start font-light text-white hover:text-brand transition-all duration-150"
              >
                Profile
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-[12px] lg:text-[16px] text-start font-light text-white hover:text-brand transition-all duration-150"
              >
                Login
              </button>
            )}
          </div>
          <hr className="block lg:hidden border border-xyellow w-full" />
          <div className="flex flex-col gap-y-2 w-full lg:w-fit items-start lg:items-start">
            <div className="mb-2 text-white">Contact</div>
            <Tooltip title="Click to copy" color={"#026839"} key={"phone"}>
              <button
                onClick={() => copy("number goes here")}
                className="text-[12px] lg:text-[16px] font-light text-white"
              >
                number
              </button>
            </Tooltip>

            <Tooltip title="Click to copy" color={"#026839"} key={"mail"}>
              <button
                onClick={() => copy("email goes here")}
                className="text-[12px] lg:text-[16px] font-light text-white"
              >
                email
              </button>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-y-2 w-full lg:w-fit items-start lg:items-start">
            <div className="mb-2 text-white">Address</div>
            <Tooltip title="Click to view" color={"#026839"} key={"location"}>
              <a
                href="https://www.google.com/maps/search/Road+4,+Block+J,+Banasree,+Dhaka,+Bangladesh/@23.7747992,90.353354,13z/data=!3m1!4b1?entry=ttu"
                target="_blank"
                className="text-[12px] lg:text-[16px] font-light text-white w-full text-start lg:text-left lg:w-fit"
              >
                location
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 lg:gap-y-6 py-2 bg-xyellow items-center">
        <div className="text-[12px] lg:text-[16px] font-medium text-xdark">
          Copyright © 2024 Swadesh Food. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
