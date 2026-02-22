import { RiTruckLine, RiCheckboxCircleFill } from "react-icons/ri";
import { useLanguage } from "../contexts/LanguageContext";
import PropTypes from "prop-types";
import { useStoreSettings } from "../contexts/StoreSettingsContext";

const FreeDeliveryBar = ({ subtotal }) => {
  const { storeSettings } = useStoreSettings();
  const { t, language } = useLanguage();

  if (subtotal === 0) return null;

  const threshold = Number(storeSettings.free_delivery_threshold || 0);
  const amountLeft = Math.max(0, threshold - subtotal);
  const progressPercent =
    threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 0;
  const isUnlocked = amountLeft === 0;

  const textAmountLeft =
    language === "bn" ? `৳${amountLeft}` : `৳${amountLeft}`;
  const message = isUnlocked
    ? t("free_delivery_unlocked") || "Free Delivery Unlocked! 🎉"
    : (
        t("add_more_for_free_delivery") ||
        "Add {amount} more for FREE Delivery!"
      ).replace("{amount}", textAmountLeft);

  return (
    <div className="w-full bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/30 px-4 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
        <div
          className={`flex items-center gap-2 text-sm md:text-base font-bold tracking-wide transition-colors ${
            isUnlocked
              ? "text-green-600 dark:text-green-400"
              : "text-neutral-700 dark:text-neutral-300"
          }`}
        >
          {isUnlocked ? (
            <RiCheckboxCircleFill className="text-xl md:text-2xl animate-bounce" />
          ) : (
            <RiTruckLine className="text-lg md:text-xl" />
          )}
          <span>{message}</span>
        </div>

        {!isUnlocked && (
          <div className="w-full max-w-xs flex items-center gap-3 mt-1 md:mt-0">
            <div className="flex-1 h-2 md:h-2.5 bg-green-200/50 dark:bg-neutral-700 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="w-full h-full bg-white/30 animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FreeDeliveryBar.propTypes = {
  subtotal: PropTypes.number.isRequired,
};

export default FreeDeliveryBar;
