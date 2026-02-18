import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useEffect, useState } from "react";
import { RiMapPinLine, RiMailLine, RiPhoneLine } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useLanguage();

  const copy = (text) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const getProfile = () => {
    api
      .get("/me")
      .then((res) => {
        if (res.status === 200) setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 font-sans mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <img
                src="/logo.png"
                alt="Swadesh Food"
                className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-6">
              {t("quick_links") || "Quick Links"}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigate("/store")}
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium"
                >
                  {t("store")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/new")}
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium"
                >
                  {t("new")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/connect")}
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium"
                >
                  {t("connect")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium"
                >
                  {isLoggedIn ? t("my_account") : t("login")}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-6">
              {t("contact_us") || "Contact Us"}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <RiPhoneLine className="text-green-600 dark:text-green-500 text-xl flex-shrink-0 mt-0.5" />
                <Tooltip title="Click to copy">
                  <button
                    onClick={() => copy("+880 1700-663922")}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors text-sm text-left"
                  >
                    +880 1700-663922
                  </button>
                </Tooltip>
              </li>
              <li className="flex items-start gap-3">
                <RiMailLine className="text-green-600 dark:text-green-500 text-xl flex-shrink-0 mt-0.5" />
                <Tooltip title="Click to copy">
                  <button
                    onClick={() => copy("swadeshagrofoodslimited@gmail.com")}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors text-sm text-left break-all"
                  >
                    swadeshagrofoodslimited@gmail.com
                  </button>
                </Tooltip>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wider mb-6">
              {t("visit_us") || "Visit Us"}
            </h3>
            <div className="flex items-start gap-3">
              <RiMapPinLine className="text-green-600 dark:text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <a
                href="https://www.google.com/maps/place/Nabil+Food+Middle+Badda/@23.7778256,90.4240329,21z/data=!4m6!3m5!1s0x3755c7bd8b3af203:0x5efacd42f1267e1f!8m2!3d23.7778459!4d90.4241912!16s%2Fg%2F11h1rm0blz!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors text-sm leading-relaxed"
              >
                Pa-67/1, Alatunnesa School Road,
                <br />
                Middle Badda, Dhaka-1212, Bangladesh
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} Swadesh Food.{" "}
            {t("all_rights_reserved") || "All rights reserved."}
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
              {t("privacy_policy") || "Privacy Policy"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
              {t("terms_of_service") || "Terms of Service"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
