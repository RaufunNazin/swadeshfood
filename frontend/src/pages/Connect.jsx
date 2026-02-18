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
import { useLanguage } from "../contexts/LanguageContext";

const Connect = () => {
  const { t } = useLanguage();

  const teamMembers = [
    {
      name: t("founder_name") || "Md. [Name]",
      role: t("founder_ceo") || "Founder & CEO",
      image:
        "https://ui-avatars.com/api/?name=Founder+One&background=0D8ABC&color=fff",
      quote:
        t("quote_founder") ||
        "Our goal is simple: Purity from the soil to your soul.",
    },
    {
      name: t("ops_name") || "Md. [Name]",
      role: t("ops_director") || "Operations Director",
      image:
        "https://ui-avatars.com/api/?name=Ops+Director&background=10b981&color=fff",
      quote:
        t("quote_ops") ||
        "Ensuring every package delivered carries a promise of quality.",
    },
    {
      name: t("sourcing_name") || "Md. [Name]",
      role: t("head_sourcing") || "Head of Sourcing",
      image:
        "https://ui-avatars.com/api/?name=Head+Sourcing&background=f59e0b&color=fff",
      quote:
        t("quote_sourcing") ||
        "I personally visit farms to select only the best for you.",
    },
  ];

  const timelineEvents = [
    {
      year: "2020",
      title: t("tl_title_1") || "The Seed is Planted",
      desc:
        t("tl_desc_1") ||
        "Started as a small community initiative to source chemical-free vegetables for friends and family during the pandemic.",
    },
    {
      year: "2022",
      title: t("tl_title_2") || "Building Trust",
      desc:
        t("tl_desc_2") ||
        "Expanded to a small warehouse in Badda. We partnered with 50+ local farmers who share our vision of organic farming.",
    },
    {
      year: "2024",
      title: t("tl_title_3") || "Swadesh Food Online",
      desc:
        t("tl_desc_3") ||
        "Launched our digital platform to make healthy, organic food accessible to every household in Dhaka.",
    },
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen font-sans text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
      <Notification />

      {/* --- Header Section --- */}
      <div className="bg-white dark:bg-neutral-800 py-16 md:py-24 text-center px-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute right-0 top-0 w-64 h-64 bg-green-300 dark:bg-green-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-300 dark:bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight relative z-10">
          {t("connect_title_1") || "Rooted in "}{" "}
          <span className="text-brand dark:text-green-400">
            {t("connect_title_2") || "Trust"}
          </span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed relative z-10">
          {t("connect_subtitle") ||
            "We aren't just a store; we are a family of farmers, dreamers, and doers committed to bringing the pure taste of Bangladesh back to your table."}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* --- Mission Section --- */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold uppercase tracking-wide">
              <RiLeafLine /> {t("our_mission_tag") || "Our Mission"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              {t("mission_title") || "Why We Do What We Do"}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed text-justify">
              {t("mission_p1_start") ||
                "In a world full of processed options, finding food that heals rather than harms is a challenge. "}
              <strong className="dark:text-white">
                {t("brand_name") || "Swadesh Food"}
              </strong>{" "}
              {t("mission_p1_end") ||
                "was born out of a necessity—the need for safe, chemical-free, and authentically sourced food."}
            </p>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed text-justify">
              {t("mission_p2") ||
                "Our mission is to bridge the gap between the hardworking rural farmers of Bangladesh and the urban families who deserve nothing but the best. Every product you receive is a testament to purity, ethics, and care."}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center gap-3">
                <MdVerified className="text-brand dark:text-green-400 text-2xl" />
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  {t("organic_100") || "100% Organic"}
                </span>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center gap-3">
                <RiUserHeartLine className="text-brand dark:text-green-400 text-2xl" />
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  {t("farmer_first") || "Farmer First"}
                </span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 h-[400px] bg-neutral-200 dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-lg relative group">
            <img
              src="/farm.jpeg"
              alt={t("our_farm") || "Our Farm"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 dark:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
              <p className="text-white font-medium italic">
                &quot;
                {t("farm_quote") || "Directly from the fields of North Bengal."}
                &quot;
              </p>
            </div>
          </div>
        </div>

        {/* --- Team Section --- */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {t("team_title") || "Meet the People Behind Swadesh"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3">
              {t("team_subtitle") || "Real people, real passion."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-lg dark:hover:shadow-neutral-900/50 transition-all hover:-translate-y-1 text-center group"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-neutral-50 dark:border-neutral-700 group-hover:border-green-100 dark:group-hover:border-green-900 transition-colors">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-brand dark:text-green-400 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 italic text-sm">
                  &quot;{member.quote}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Timeline Section --- */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-brand/10 dark:bg-green-900/30 rounded-full text-brand dark:text-green-400">
              <RiHistoryLine size={24} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t("timeline_title") || "Our Journey So Far"}
            </h2>
          </div>

          <div className="relative border-l-2 border-neutral-200 dark:border-neutral-700 ml-4 space-y-12">
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand dark:bg-green-500 border-4 border-white dark:border-neutral-800 shadow-sm"></div>
                <span className="text-sm font-bold text-brand dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full mb-2 inline-block">
                  {event.year}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {event.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl">
                  {event.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Contact Info (Simplified) --- */}
        <div className="grid md:grid-cols-3 gap-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-3xl p-8 md:p-12 border border-transparent dark:border-neutral-700">
          <div className="flex flex-col items-center text-center p-4">
            <MdOutlinePhoneInTalk className="text-3xl mb-4 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-lg mb-1">
              {t("call_us") || "Call Us"}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t("phone_number_val") || "+880 1700-663922"}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-700">
            <MdOutlineMailOutline className="text-3xl mb-4 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-lg mb-1">
              {t("email_us") || "Email Us"}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 break-all">
              {t("email_val") || "swadeshagrofoodslimited@gmail.com"}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-700">
            <MdLocationPin className="text-3xl mb-4 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-lg mb-1">
              {t("visit_us") || "Visit Us"}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {t("address_line") || "Middle Badda, Dhaka-1212"}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
