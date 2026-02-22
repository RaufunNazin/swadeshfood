import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "react-toastify/dist/ReactToastify.css";
import {
  RiUserLine,
  RiMailLine,
  RiLockPasswordLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import { useLanguage } from "../contexts/LanguageContext"; // Import Language Context

// --- Updated InputField with Dark Mode ---
const InputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  onKeyDown,
}) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors">
      <Icon className="text-xl" />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full pl-12 pr-4 py-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 focus:bg-white dark:focus:bg-neutral-600 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:focus:ring-green-500/20 outline-none transition-all text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  </div>
);

InputField.propTypes = {
  icon: PropTypes.elementType.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
};

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      register();
    }
  };

  const register = () => {
    if (!username || !email || !password || !cPassword) {
      toast.error(t("fill_all_fields") || "Please fill in all fields");
      return;
    }
    if (password !== cPassword) {
      toast.error(t("passwords_mismatch") || "Passwords do not match");
      return;
    }

    setLoading(true);
    api
      .post("/register", {
        username: username,
        email: email,
        password: password,
      })
      .then((res) => {
        if (res.status === 201) {
          navigate("/", { state: "register" });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          err.response?.data?.detail ||
            t("reg_failed") ||
            "Registration failed. Please try again.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-green-200/20 dark:bg-green-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium z-10"
      >
        <RiArrowLeftLine className="text-xl" />
        <span className="hidden sm:inline">
          {t("back_home") || "Back to Home"}
        </span>
      </button>

      <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-3xl shadow-xl shadow-neutral-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-white dark:border-neutral-700 transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Swadesh Food"
            className="h-14 mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {t("create_account") || "Create Account"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-center text-sm">
            {t("join_us") || "Join us for authentic and healthy food"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <InputField
            icon={RiUserLine}
            type="text"
            placeholder={t("username") || "Username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <InputField
            icon={RiMailLine}
            type="email"
            placeholder={t("email") || "Email Address"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <InputField
            icon={RiLockPasswordLine}
            type="password"
            placeholder={t("password") || "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <InputField
            icon={RiLockPasswordLine}
            type="password"
            placeholder={t("confirm_password") || "Confirm Password"}
            value={cPassword}
            onChange={(e) => setCPassword(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          <button
            type="button"
            onClick={register}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-200 dark:shadow-none hover:shadow-xl hover:shadow-green-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading
              ? t("creating_account") || "Creating Account..."
              : t("register") || "Register"}
          </button>

          <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {t("already_have_account") || "Already have an account?"}{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-green-600 dark:text-green-400 font-bold hover:underline underline-offset-2"
              >
                {t("log_in") || "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
