import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import {
  RiTruckLine,
  RiLeafLine,
  RiErrorWarningLine,
  RiFlashlightLine,
} from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../api";

// Configuration map for types
const TYPE_CONFIG = {
  info: {
    icon: RiTruckLine,
    bgClass: "bg-neutral-900 dark:bg-black",
    iconColor: "text-blue-400",
  },
  success: {
    icon: RiLeafLine,
    bgClass: "bg-green-700 dark:bg-green-950",
    iconColor: "text-green-300",
  },
  warning: {
    icon: RiErrorWarningLine,
    bgClass: "bg-orange-500 dark:bg-orange-950",
    iconColor: "text-orange-200",
  },
  urgent: {
    icon: RiFlashlightLine,
    bgClass: "bg-red-600 dark:bg-red-950",
    iconColor: "text-red-200",
  },
};

const Notification = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    api
      .get("/admin/notification")
      .then((res) => setBannerData(res.data))
      .catch((err) => console.error("Failed to fetch notification", err))
      .finally(() => setLoading(false));
  }, []);

  // Determine if the banner should be shown right now
  const shouldShow = !loading && isVisible && bannerData?.is_active === 1;

  // Safe data extraction (handles the initial null state perfectly)
  const messageEn =
    bannerData?.text_en ||
    t("delivery_notice") ||
    "We deliver across Bangladesh!";
  const messageBn =
    bannerData?.text_bn ||
    t("delivery_notice") ||
    "আমরা সমগ্র বাংলাদেশে ডেলিভারি দিচ্ছি!";
  const displayMessage = language === "bn" ? messageBn : messageEn;

  const isHighlighted = bannerData?.is_highlighted === 1;
  const currentType = bannerData?.notif_type || "info";

  const config = TYPE_CONFIG[currentType] || TYPE_CONFIG.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`grid transition-all duration-500 ease-in-out ${
        shouldShow ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        <div
          className={`w-full text-white relative z-[20] flex items-center
            ${config.bgClass} 
            ${isHighlighted ? "animate-pulse py-3.5 px-4 font-bold md:py-4" : "py-2.5 px-4"}
          `}
        >
          <div className="max-w-7xl mx-auto flex justify-center items-center gap-3 w-full">
            <div
              className={`flex items-center gap-2 tracking-wide 
                ${isHighlighted ? "text-sm md:text-base" : "text-xs md:text-sm font-medium"}
              `}
            >
              <IconComponent
                className={`${config.iconColor} ${isHighlighted ? "text-xl" : "text-lg"}`}
              />
              <span>{displayMessage}</span>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/20"
            aria-label="Close notification"
          >
            <RxCross2 size={isHighlighted ? 20 : 16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
