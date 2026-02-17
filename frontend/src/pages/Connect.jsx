import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../components/Notification";
import {
  MdOutlinePhoneInTalk,
  MdLocationPin,
  MdOutlineMailOutline,
} from "react-icons/md";

const Connect = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <Notification />

      {/* Header Section */}
      <div className="bg-white py-12 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Let&apos;s <span className="text-brand">Connect</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
          We are here to help and answer any questions you might have. We look
          forward to hearing from you.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info Cards */}
          <div className="flex flex-col gap-8">
            {/* About Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                About Us
                <div className="h-1 w-12 bg-brand rounded-full ml-2"></div>
              </h2>
              <p className="text-gray-600 leading-relaxed text-justify">
                Swadesh Food collects pure and organic food products from
                different parts of Bangladesh and delivers them to your
                doorstep. We are committed to providing you with the best
                quality products at the best prices. Our products are sourced
                directly from farmers and are free from chemicals and
                pesticides.
              </p>
            </div>

            {/* Contact Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Get in Touch
                <div className="h-1 w-12 bg-brand rounded-full ml-2"></div>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-brand/10 p-3 rounded-lg text-brand">
                    <MdOutlinePhoneInTalk className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+880 1700-663922</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand/10 p-3 rounded-lg text-brand">
                    <MdOutlineMailOutline className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">
                      swadeshagrofoodslimited@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand/10 p-3 rounded-lg text-brand">
                    <MdLocationPin className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Headquarters
                    </h3>
                    <p className="text-gray-600">
                      Pa-67/1, Alatunnesa School Road, Middle Badda, Dhaka-1212,
                      Bangladesh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 h-[500px] overflow-hidden">
            <iframe
              title="Map"
              className="w-full h-full rounded-xl grayscale hover:grayscale-0 transition-all duration-500"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d228.19660592098845!2d90.4240329484263!3d23.777825645342457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7bd8b3af203%3A0x5efacd42f1267e1f!2sNabil%20Food%20Middle%20Badda!5e0!3m2!1sen!2sbd!4v1771310167130!5m2!1sen!2sbd"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
