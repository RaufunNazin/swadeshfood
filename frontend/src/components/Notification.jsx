import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { RiTruckLine } from "react-icons/ri";

const Notification = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gray-900 text-white w-full py-2.5 px-4 relative z-[60] transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-center items-center gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium tracking-wide">
          <RiTruckLine className="text-green-400 text-lg" />
          <span>
            We deliver across Bangladesh!
            <span className="text-gray-400 font-light ml-2 hidden sm:inline border-l border-gray-700 pl-2">
              Taste the Purity of Nature.
            </span>
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
        aria-label="Close notification"
      >
        <RxCross2 size={16} />
      </button>
    </div>
  );
};

export default Notification;
