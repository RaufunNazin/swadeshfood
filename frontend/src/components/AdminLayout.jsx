import SidePanel from "./SidePanel";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

const AdminLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <SidePanel />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Area */}
        <header className="bg-white dark:bg-neutral-800 shadow-sm z-10 p-4 px-8 flex justify-between mx-auto max-w-7xl w-full items-center h-16 transition-colors duration-300 m-5 rounded-xl">
          <h1 className="text-xl font-mono text-neutral-800 dark:text-white">
            {title}
          </h1>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 dark:bg-neutral-900 p-6 transition-colors duration-300">
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
