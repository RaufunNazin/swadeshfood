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
  RiCheckLine,
  RiPhoneLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

// --- Upgraded InputField with dynamic status highlights ---
const InputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  onKeyDown,
  status = "none", // "none" | "error" | "warning" | "success"
}) => {
  let stylingClasses =
    "border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:focus:ring-green-500/20 bg-neutral-50 dark:bg-neutral-700 focus:bg-white dark:focus:bg-neutral-600";
  let iconColor =
    "text-neutral-400 dark:text-neutral-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-400";

  if (status === "error") {
    stylingClasses =
      "border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30 bg-red-50/50 dark:bg-red-900/10 placeholder-red-400/70";
    iconColor = "text-red-500 dark:text-red-400";
  } else if (status === "warning") {
    stylingClasses =
      "border-yellow-300 dark:border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-100 dark:focus:ring-yellow-900/30 bg-yellow-50/50 dark:bg-yellow-900/10 placeholder-yellow-500/60";
    iconColor = "text-yellow-500 dark:text-yellow-400";
  } else if (status === "success") {
    stylingClasses =
      "border-green-400 dark:border-green-500/50 focus:border-green-500 focus:ring-green-100 dark:focus:ring-green-900/30 bg-green-50/50 dark:bg-green-900/10 placeholder-green-500/60";
    iconColor = "text-green-500 dark:text-green-400";
  }

  return (
    <div className="relative group">
      <div
        className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${iconColor}`}
      >
        {status === "success" ? (
          <RiCheckLine className="text-xl" />
        ) : (
          <Icon className="text-xl" />
        )}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-4 rounded-xl border outline-none transition-all text-neutral-800 dark:text-white ${stylingClasses}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

InputField.propTypes = {
  icon: PropTypes.elementType.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  status: PropTypes.oneOf(["none", "error", "warning", "success"]),
};

// --- Validation Helpers ---
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateName = (name) => name.trim().length >= 3;
const validateBdPhone = (phone) => {
  if (!phone.trim()) return true; // It's optional, so empty is valid
  const cleanPhone = phone.replace(/[\s-]/g, "");
  return /^(?:\+88|88)?01[3-9]\d{8}$/.test(cleanPhone);
};

// --- Password Strength Calculator ---
const calculateStrength = (pass) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score += 25;
  if (/[A-Z]/.test(pass)) score += 25;
  if (/[0-9]/.test(pass)) score += 25;
  if (/[^A-Za-z0-9]/.test(pass)) score += 25;
  return score;
};

const Register = () => {
  const navigate = useNavigate();
  const { t, language, switchLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSubmitErrors, setShowSubmitErrors] = useState(false);

  // Blur Status States
  const [blurNameStatus, setBlurNameStatus] = useState("none");
  const [blurEmailStatus, setBlurEmailStatus] = useState("none");
  const [blurPhoneStatus, setBlurPhoneStatus] = useState("none");
  const [blurPassStatus, setBlurPassStatus] = useState("none");
  const [blurCPassStatus, setBlurCPassStatus] = useState("none");

  // --- Handlers ---
  const handleNameBlur = () => {
    if (!fullName.trim()) return setBlurNameStatus("none");
    setBlurNameStatus(validateName(fullName) ? "success" : "error");
  };

  const handleEmailBlur = () => {
    if (!email.trim()) return setBlurEmailStatus("none");
    setBlurEmailStatus(validateEmail(email) ? "success" : "error");
  };

  const handlePhoneBlur = () => {
    if (!phone.trim()) return setBlurPhoneStatus("none");
    setBlurPhoneStatus(validateBdPhone(phone) ? "success" : "error");
  };

  const handlePassBlur = () => {
    if (!password) return setBlurPassStatus("none");
    setBlurPassStatus(password.length >= 8 ? "success" : "error");
    // Re-check confirm password if it's already filled
    if (cPassword) {
      setBlurCPassStatus(password === cPassword ? "success" : "error");
    }
  };

  const handleCPassBlur = () => {
    if (!cPassword) return setBlurCPassStatus("none");
    setBlurCPassStatus(password === cPassword ? "success" : "error");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") register();
  };

  const register = () => {
    setShowSubmitErrors(true);
    setTimeout(() => setShowSubmitErrors(false), 2000);

    if (!fullName || !email || !password || !cPassword) {
      toast.error(t("fill_all_fields") || "Please fill in all required fields");
      return;
    }
    if (!validateName(fullName)) {
      toast.error("Full name must be at least 3 characters");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (phone && !validateBdPhone(phone)) {
      toast.error("Please enter a valid Bangladesh phone number");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== cPassword) {
      toast.error(t("passwords_mismatch") || "Passwords do not match");
      return;
    }

    setLoading(true);
    api
      .post("/register", {
        full_name: fullName,
        email: email,
        phone: phone || null, // Optional
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

  // Status computation for rendering
  const nameStatus =
    blurNameStatus !== "none"
      ? blurNameStatus
      : showSubmitErrors && !fullName
        ? "error"
        : "none";
  const emailStatus =
    blurEmailStatus !== "none"
      ? blurEmailStatus
      : showSubmitErrors && !email
        ? "error"
        : "none";
  const phoneStatus = blurPhoneStatus !== "none" ? blurPhoneStatus : "none"; // Optional, no submit error
  const passStatus =
    blurPassStatus !== "none"
      ? blurPassStatus
      : showSubmitErrors && !password
        ? "error"
        : "none";
  const cPassStatus =
    blurCPassStatus !== "none"
      ? blurCPassStatus
      : showSubmitErrors && !cPassword
        ? "error"
        : "none";

  // Strength UI Logic
  const strengthScore = calculateStrength(password);
  const getStrengthConfig = () => {
    if (strengthScore <= 25)
      return { color: "bg-red-500", text: "Weak", bars: 1 };
    if (strengthScore <= 50)
      return { color: "bg-orange-500", text: "Fair", bars: 2 };
    if (strengthScore <= 75)
      return { color: "bg-yellow-500", text: "Good", bars: 3 };
    return { color: "bg-green-500", text: "Strong", bars: 4 };
  };
  const strengthConfig = getStrengthConfig();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-green-200/20 dark:bg-green-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium z-10"
      >
        <RiArrowLeftLine className="text-xl" />
        <span className="hidden sm:inline">
          {t("back_home") || "Back to Home"}
        </span>
      </button>

      {/* --- ADD THIS NEW BLOCK: Top Right Toggles --- */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
        <button
          onClick={() => switchLanguage(language === "en" ? "bn" : "en")}
          className="hidden sm:flex text-neutral-500 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 p-1.5 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-xs font-bold flex-col items-center leading-none"
          title="Switch Language"
        >
          <span className={language === "en" ? "text-green-600" : ""}>EN</span>
          <span className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-600 my-[1px]"></span>
          <span className={language === "bn" ? "text-green-600" : ""}>BN</span>
        </button>

        <button
          onClick={toggleTheme}
          className="text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          {theme === "light" ? (
            <IoMoonOutline className="text-xl" />
          ) : (
            <IoSunnyOutline className="text-xl" />
          )}
        </button>
      </div>
      {/* --- END NEW BLOCK --- */}

      <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-3xl shadow-xl shadow-neutral-200/50 dark:shadow-none p-8 md:p-12 relative z-10 border border-white dark:border-neutral-700 transition-colors duration-300">
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

        <div className="space-y-4">
          <InputField
            icon={RiUserLine}
            type="text"
            placeholder={t("full_name") || "Full Name"}
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (blurNameStatus !== "none") setBlurNameStatus("none");
            }}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyPress}
            status={nameStatus}
          />
          <InputField
            icon={RiMailLine}
            type="email"
            placeholder={t("email") || "Email Address"}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (blurEmailStatus !== "none") setBlurEmailStatus("none");
            }}
            onBlur={handleEmailBlur}
            onKeyDown={handleKeyPress}
            status={emailStatus}
          />
          <InputField
            icon={RiPhoneLine}
            type="text"
            placeholder={t("phone_optional") || "Phone Number (Optional)"}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (blurPhoneStatus !== "none") setBlurPhoneStatus("none");
            }}
            onBlur={handlePhoneBlur}
            onKeyDown={handleKeyPress}
            status={phoneStatus}
          />

          <div>
            <InputField
              icon={RiLockPasswordLine}
              type="password"
              placeholder={t("password") || "Password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (blurPassStatus !== "none") setBlurPassStatus("none");
                if (cPassword)
                  setBlurCPassStatus(
                    e.target.value === cPassword ? "success" : "none",
                  );
              }}
              onBlur={handlePassBlur}
              onKeyDown={handleKeyPress}
              status={passStatus}
            />
            {/* Password Strength Bar */}
            {password && (
              <div className="mt-2 px-1">
                <div className="flex gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        strengthConfig.bars >= bar
                          ? strengthConfig.color
                          : "bg-neutral-200 dark:bg-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-[10px] font-semibold mt-1 text-right transition-colors ${strengthConfig.color.replace("bg-", "text-")}`}
                >
                  {strengthConfig.text}
                </p>
              </div>
            )}
          </div>

          <InputField
            icon={RiLockPasswordLine}
            type="password"
            placeholder={t("confirm_password") || "Confirm Password"}
            value={cPassword}
            onChange={(e) => {
              setCPassword(e.target.value);
              setBlurCPassStatus(
                e.target.value === password ? "success" : "none",
              );
            }}
            onBlur={handleCPassBlur}
            onKeyDown={handleKeyPress}
            status={cPassStatus}
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
