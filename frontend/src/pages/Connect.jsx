import Footer from "../components/Footer";
import "react-toastify/dist/ReactToastify.css";
import Notification from "../components/Notification";
import {
  MdOutlinePhoneInTalk,
  MdLocationPin,
  MdOutlineMailOutline,
  MdVerified,
} from "react-icons/md";
import { RiLeafLine, RiUserHeartLine, RiHistoryLine } from "react-icons/ri";

const Connect = () => {
  const teamMembers = [
    {
      name: "Md. [Name]", // Replace with actual name
      role: "Founder & CEO",
      image:
        "https://ui-avatars.com/api/?name=Founder+One&background=0D8ABC&color=fff", // Placeholder or real image URL
      quote: "Our goal is simple: Purity from the soil to your soul.",
    },
    {
      name: "Md. [Name]", // Replace with actual name
      role: "Operations Director",
      image:
        "https://ui-avatars.com/api/?name=Ops+Director&background=10b981&color=fff",
      quote: "Ensuring every package delivered carries a promise of quality.",
    },
    {
      name: "Md. [Name]", // Replace with actual name
      role: "Head of Sourcing",
      image:
        "https://ui-avatars.com/api/?name=Head+Sourcing&background=f59e0b&color=fff",
      quote: "I personally visit farms to select only the best for you.",
    },
  ];

  const timelineEvents = [
    {
      year: "2020",
      title: "The Seed is Planted",
      desc: "Started as a small community initiative to source chemical-free vegetables for friends and family during the pandemic.",
    },
    {
      year: "2022",
      title: "Building Trust",
      desc: "Expanded to a small warehouse in Badda. We partnered with 50+ local farmers who share our vision of organic farming.",
    },
    {
      year: "2024",
      title: "Swadesh Food Online",
      desc: "Launched our digital platform to make healthy, organic food accessible to every household in Dhaka.",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <Notification />

      {/* --- Header Section --- */}
      <div className="bg-white py-16 md:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute right-0 top-0 w-64 h-64 bg-green-300 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight relative z-10">
          Rooted in <span className="text-brand">Trust</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed relative z-10">
          We aren&apos;t just a store; we are a family of farmers, dreamers, and
          doers committed to bringing the pure taste of Bangladesh back to your
          table.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* --- Mission Section --- */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold uppercase tracking-wide">
              <RiLeafLine /> Our Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why We Do What We Do
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed text-justify">
              In a world full of processed options, finding food that heals
              rather than harms is a challenge. <strong>Swadesh Food</strong>{" "}
              was born out of a necessity—the need for safe, chemical-free, and
              authentically sourced food.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed text-justify">
              Our mission is to bridge the gap between the hardworking rural
              farmers of Bangladesh and the urban families who deserve nothing
              but the best. Every product you receive is a testament to purity,
              ethics, and care.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <MdVerified className="text-brand text-2xl" />
                <span className="font-semibold text-gray-700">
                  100% Organic
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <RiUserHeartLine className="text-brand text-2xl" />
                <span className="font-semibold text-gray-700">
                  Farmer First
                </span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 h-[400px] bg-gray-200 rounded-3xl overflow-hidden shadow-lg relative group">
            {/* Replace with a real image of farm or produce */}
            <img
              src="/farm.jpeg"
              alt="Our Farm"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <p className="text-white font-medium italic">
                &quot;Directly from the fields of North Bengal.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* --- Team Section --- */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Meet the People Behind Swadesh
            </h2>
            <p className="text-gray-500 mt-3">Real people, real passion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 text-center group"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gray-50 group-hover:border-green-100 transition-colors">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-brand font-medium mb-4">{member.role}</p>
                <p className="text-gray-500 italic text-sm">
                  &quot;{member.quote}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Timeline Section --- */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-brand/10 rounded-full text-brand">
              <RiHistoryLine size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Our Journey So Far
            </h2>
          </div>

          <div className="relative border-l-2 border-gray-200 ml-4 space-y-12">
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand border-4 border-white shadow-sm"></div>
                <span className="text-sm font-bold text-brand bg-green-50 px-3 py-1 rounded-full mb-2 inline-block">
                  {event.year}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 max-w-2xl">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Contact Info (Simplified) --- */}
        <div className="grid md:grid-cols-3 gap-6 bg-gray-100 text-gray-800 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col items-center text-center p-4">
            <MdOutlinePhoneInTalk className="text-3xl mb-4 text-green-600" />
            <h3 className="font-bold text-lg mb-1">Call Us</h3>
            <p className="text-gray-600">+880 1700-663922</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 border-t md:border-t-0 md:border-l border-gray-700">
            <MdOutlineMailOutline className="text-3xl mb-4 text-green-600" />
            <h3 className="font-bold text-lg mb-1">Email Us</h3>
            <p className="text-gray-600 break-all">
              swadeshagrofoodslimited@gmail.com
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 border-t md:border-t-0 md:border-l border-gray-700">
            <MdLocationPin className="text-3xl mb-4 text-green-600" />
            <h3 className="font-bold text-lg mb-1">Visit Us</h3>
            <p className="text-gray-600 text-sm">Middle Badda, Dhaka-1212</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
