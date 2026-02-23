import { RiErrorWarningFill } from "react-icons/ri";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-green-200/20 dark:bg-green-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-red-200/10 dark:bg-red-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-3xl shadow-xl shadow-neutral-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-white dark:border-neutral-700 transition-colors duration-300 text-center">
        {/* Warning Icon */}
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <RiErrorWarningFill className="text-4xl" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          Payment is Due
        </h1>

        {/* Subtext with Green Highlight */}
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          This website has been temporarily suspended. Full services and updates
          will be restored immediately once the{" "}
          <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
            pending payment
          </span>{" "}
          is cleared.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
