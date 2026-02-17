import SidePanel from "./SidePanel";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

const AdminLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidePanel />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Area */}
        <header className="bg-white shadow-sm z-10 p-4 px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <div className="flex items-center gap-4">
            {/* You can add a notification bell or profile avatar here later */}
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto max-w-7xl">{children}</div>
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
