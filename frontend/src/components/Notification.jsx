import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { RiTruckLine } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../api";

const Notification = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [bannerData, setBannerData] = useState(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    api
      .get("/notification")
      .then((res) => {
        setBannerData(res.data);
      })
      .catch((err) => console.error("Failed to fetch notification", err));
  }, []);

  // Don't render if it's explicitly turned off in DB, or if user closed it
  if (!isVisible || (bannerData && bannerData.is_active === 0)) return null;

  // Fallback text while loading or if API fails
  const messageEn =
    bannerData?.text_en ||
    t("delivery_notice") ||
    "We deliver across Bangladesh!";
  const messageBn =
    bannerData?.text_bn ||
    t("delivery_notice") ||
    "আমরা সমগ্র বাংলাদেশে ডেলিভারি দিচ্ছি!";

  const displayMessage = language === "bn" ? messageBn : messageEn;

  return (
    <div className="bg-neutral-900 dark:bg-black text-white w-full py-2.5 px-4 relative z-[20] transition-all duration-300 border-b border-transparent dark:border-neutral-800">
      <div className="max-w-7xl mx-auto flex justify-center items-center gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium tracking-wide">
          <RiTruckLine className="text-green-400 text-lg" />
          <span>
            {displayMessage}
            <span className="text-neutral-400 font-light ml-2 hidden sm:inline border-l border-neutral-700 pl-2">
              {t("brand_tagline") || "Taste the Purity of Nature."}
            </span>
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
        aria-label="Close notification"
      >
        <RxCross2 size={16} />
      </button>
    </div>
  );
};

export default Notification;
