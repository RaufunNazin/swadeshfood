import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../components/Notification";
import {
  MdOutlinePhoneInTalk,
  MdLocationPin,
  MdOutlineMailOutline,
} from "react-icons/md";

const Connect = () => {
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
        <div className="text-xdark text-4xl md:text-7xl font-bold">Connect</div>
        <div className="">Home / Connect</div>
      </div>
      <div className="px-3 md:w-4/5 lg:w-4/5 xl:w-3/5 mx-auto py-5 my-5 lg:my-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <div className="font-bold text-xl md:text-2xl uppercase text-xdark">
              About us
            </div>
            <hr />
            <div className="text-xlightgray text-justify">
              Swadesh Food collects pure and organic food products from
              different parts of Bangladsesh and delivers them to your doorstep. We
              are committed to providing you with the best quality products at
              the best prices. Our products are sourced directly from farmers
              and are free from chemicals and pesticides.
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="font-bold text-xl md:text-2xl uppercase text-xdark">
              Contact us
            </div>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-center gap-3">
                <div>
                  <MdOutlinePhoneInTalk className="text-xl md:text-3xl text-brand" />
                </div>
                <div>
                  <strong>Phone: </strong>Mobile number
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <MdOutlineMailOutline className="text-xl md:text-3xl text-brand" />
                </div>
                <div>
                  <strong>Email: </strong>Email address
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <div>
                  <MdLocationPin className="text-xl md:text-3xl text-brand" />
                </div>
                <div>
                  <strong>Location: </strong>Address
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <iframe className="w-full h-full" src="https://maps.google.com/maps?q=keari%20plaza&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed"></iframe>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
