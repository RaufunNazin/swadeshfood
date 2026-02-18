import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { RiTruckLine } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext";

const Notification = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    // Added dark:bg-neutral-950 to ensure distinction in dark mode
    <div className="bg-neutral-900 dark:bg-black text-white w-full py-2.5 px-4 relative z-[20] transition-all duration-300 border-b border-transparent dark:border-neutral-800">
      <div className="max-w-7xl mx-auto flex justify-center items-center gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium tracking-wide">
          <RiTruckLine className="text-green-400 text-lg" />
          <span>
            {t("delivery_notice") || "We deliver across Bangladesh!"}
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
