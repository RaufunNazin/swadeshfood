import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Template = () => {
  return (
    <div className="relative">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        draggable={true}
        pauseOnHover={false}
        theme="colored"
      />
      <div className="bg-brand text-white text-center w-full py-2 text-sm font-semibold">
        Offers coming soon!
      </div>
      <div className="lg:sticky top-0 z-50 bg-accent">
        <Navbar active="home" />
      </div>
      <div></div>
      <Footer />
    </div>
  );
};

export default Template;
