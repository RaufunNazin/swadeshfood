import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../components/Notification";

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
      <Notification />
      <div className="lg:sticky top-0 z-50 bg-accent">
        <Navbar active="home" />
      </div>
      <div
        className="h-40 md:h-72 text-center flex flex-col gap-y-1 md:gap-y-3 items-center justify-start pt-3 md:pt-10"
        style={{
          backgroundImage: "url('/Navigation.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-xdark text-4xl md:text-7xl font-bold">
          Template
        </div>
        <div className="">Home / Template</div>
      </div>
      <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto py-5 my-5 lg:my-10"></div>
      <Footer />
    </div>
  );
};

export default Template;
