import SidePanel from "./SidePanel";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

const AdminLayout = ({ children, title }) => {
  // We strictly don't need useLanguage here unless 'title' needs translation dynamically,
  // but usually admin titles are passed as props.
  // We use useTheme to ensure specific dark mode styles if needed,
  // though Tailwind 'dark:' classes handle most of it automatically.

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <SidePanel />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Area */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 p-4 px-8 flex justify-between items-center h-16 transition-colors duration-300 border-b border-transparent dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h1>
          <div className="flex items-center gap-4">
            {/* Admin Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand/10 dark:bg-green-900/30 text-brand dark:text-green-400 flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
          <div className="container mx-auto max-w-7xl">
            {/* Render children directly; ensure children components are also dark-mode ready */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};

export default AdminLayout;
