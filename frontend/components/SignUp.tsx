import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { Bricolage_Grotesque, Sora } from "next/font/google";
import { api } from "@/lib/api";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

interface SignUpProps {
  onSignUp: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => void;
  onNavigate: (page: "login") => void;
  isLoading?: boolean;
}

export function SignUp({
  onSignUp,
  onNavigate,
  isLoading = false,
}: SignUpProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
        if (!value) return "First name is required";
        if (value.length < 2) return "First name must be at least 2 characters";
        return "";
      case "lastName":
        if (!value) return "Last name is required";
        if (value.length < 2) return "Last name must be at least 2 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        // Simple regex to match basic email format
        // eslint-disable-next-line no-useless-escape
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value))
          return "Password must contain a lowercase letter";
        if (!/(?=.*[A-Z])/.test(value))
          return "Password must contain an uppercase letter";
        if (!/(?=.*\d)/.test(value)) return "Password must contain a number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    setErrors({
      ...errors,
      [name]: validateField(name, formData[name as keyof typeof formData]),
    });
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&#])/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = [
    "",
    "bg-[#ed1c24]",
    "bg-[#ffb81c]",
    "bg-[#00a651]",
    "bg-[#00a651]",
    "bg-[#00a651]",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(newErrors).length === 0) {
      const { confirmPassword, ...signUpData } = formData;
      onSignUp(signUpData);
    }
  };

  return (
    <div
      className={`${bricolage.variable} ${sora.variable} min-h-screen relative overflow-hidden font-sans`}
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Brutalist background with geometric shapes */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Base green gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />

        {/* Diagonal geometric shapes */}
        <motion.div
          animate={{
            rotate: [0, 2, -2, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 -right-24 w-[600px] h-[600px] bg-[#ffb81c] opacity-15"
          style={{
            clipPath: "polygon(40% 0%, 100% 0%, 60% 100%, 0% 100%)",
            transform: "rotate(-15deg)",
          }}
        />
        <motion.div
          animate={{
            rotate: [0, -3, 3, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-[#ed1c24] opacity-[0.12]"
          style={{
            clipPath: "polygon(0% 0%, 60% 0%, 100% 100%, 40% 100%)",
            transform: "rotate(12deg)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main content with asymmetric layout */}
      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-[1.2fr_0.9fr] items-center p-6 lg:p-12 gap-8 lg:gap-0">
        {/* Left Side - Hero */}
        <motion.div
          initial={{ opacity: 0, x: -100, rotate: -2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-20 lg:-mr-20"
        >
          {/* Diagonal accent bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "8px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -left-8 top-0 bottom-0 bg-[#ffb81c] lg:block hidden"
            style={{ transform: "skewY(-5deg)" }}
          />

          <div className="space-y-10 lg:space-y-12 text-white pl-0 lg:pl-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="flex flex-col gap-4"
            >
              <div className="inline-flex items-center gap-4 w-fit">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  className="relative w-20 h-20 bg-[#ffb81c] p-2 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]"
                >
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <Image
                      src="/nsbe-logo.png"
                      alt="NSBE Logo"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                </motion.div>
                <div>
                  <h1
                    className={`text-4xl lg:text-5xl font-bold tracking-tight`}
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    NSBE UCF
                  </h1>
                  <p
                    className={`text-sm text-white/60 uppercase tracking-widest mt-1`}
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    Event Tracker
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="inline-block"
              >
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#00a651] text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
                  <ArrowRight className="w-4 h-4" />
                  <span>Join the Chapter</span>
                </div>
              </motion.div>

              <h2
                className={`text-5xl lg:text-7xl xl:text-8xl font-extrabold leading-[0.95] tracking-tight`}
                style={{
                  fontFamily: "var(--font-bricolage)",
                  lineHeight: "0.95",
                }}
              >
                Create Your
                <br />
                <span className="text-[#ffb81c] relative inline-block">
                  Account
                  <motion.span
                    animate={{ width: ["0%", "100%", "0%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-0 left-0 h-2 bg-[#ffb81c] opacity-50"
                    style={{ transform: "skewX(-15deg)" }}
                  />
                </span>
              </h2>

              <p
                className={`text-lg lg:text-xl text-white/80 leading-relaxed max-w-xl`}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Track your 1-1-1 and 3-3-3 progress, check in to events, and
                stay connected with the NSBE UCF community.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Brutalist Sign Up Card */}
        <motion.div
          initial={{ opacity: 0, x: 100, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2,
          }}
          className="relative z-30 w-full max-w-lg lg:-ml-12"
        >
          {/* Card shadow effect */}
          <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 lg:block hidden" />

          {/* Main card */}
          <div className="relative bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 lg:p-10">
            {/* Diagonal corner accent */}
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-[#ffb81c]" />

            {/* Card Header */}
            <div className="mb-10">
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className={`text-4xl lg:text-5xl font-extrabold mb-3 text-black tracking-tight`}
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                CREATE ACCOUNT
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className={`text-sm text-black/60 uppercase tracking-wider`}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Fill in your information to get started
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* First Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="space-y-2"
                >
                  <label
                    htmlFor="firstName"
                    className={`text-sm font-bold text-black uppercase tracking-wide`}
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    First Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 transition-colors group-focus-within:text-black" />
                    <input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      onBlur={() => handleBlur("firstName")}
                      disabled={isLoading}
                      style={{ fontFamily: "var(--font-sora)" }}
                      className={`w-full pl-12 pr-4 py-4 bg-black/5 border-2 ${
                        touched.firstName && errors.firstName
                          ? "border-[#ed1c24] focus:border-[#ed1c24]"
                          : "border-black focus:border-[#00a651]"
                      } text-black placeholder:text-black/40 focus:outline-none transition-all duration-200 hover:bg-black/10 focus:bg-black/10 font-medium`}
                    />
                  </div>
                  {touched.firstName && errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm text-[#ed1c24] flex items-center gap-2 font-medium`}
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      <span className="font-bold">⚠</span> {errors.firstName}
                    </motion.p>
                  )}
                </motion.div>

                {/* Last Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="space-y-2"
                >
                  <label
                    htmlFor="lastName"
                    className={`text-sm font-bold text-black uppercase tracking-wide`}
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    Last Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 transition-colors group-focus-within:text-black" />
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      disabled={isLoading}
                      style={{ fontFamily: "var(--font-sora)" }}
                      className={`w-full pl-12 pr-4 py-4 bg-black/5 border-2 ${
                        touched.lastName && errors.lastName
                          ? "border-[#ed1c24] focus:border-[#ed1c24]"
                          : "border-black focus:border-[#00a651]"
                      } text-black placeholder:text-black/40 focus:outline-none transition-all duration-200 hover:bg-black/10 focus:bg-black/10 font-medium`}
                    />
                  </div>
                  {touched.lastName && errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm text-[#ed1c24] flex items-center gap-2 font-medium`}
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      <span className="font-bold">⚠</span> {errors.lastName}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="email"
                  className={`text-sm font-bold text-black uppercase tracking-wide`}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 transition-colors group-focus-within:text-black" />
                  <input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    disabled={isLoading}
                    style={{ fontFamily: "var(--font-sora)" }}
                    className={`w-full pl-12 pr-4 py-4 bg-black/5 border-2 ${
                      touched.email && errors.email
                        ? "border-[#ed1c24] focus:border-[#ed1c24]"
                        : "border-black focus:border-[#00a651]"
                    } text-black placeholder:text-black/40 focus:outline-none transition-all duration-200 hover:bg-black/10 focus:bg-black/10 font-medium`}
                  />
                </div>
                {touched.email && errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm text-[#ed1c24] flex items-center gap-2 font-medium`}
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    <span className="font-bold">⚠</span> {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="password"
                  className={`text-sm font-bold text-black uppercase tracking-wide`}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 transition-colors group-focus-within:text-black" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    disabled={isLoading}
                    style={{ fontFamily: "var(--font-sora)" }}
                    className={`w-full pl-12 pr-12 py-4 bg-black/5 border-2 ${
                      touched.password && errors.password
                        ? "border-[#ed1c24] focus:border-[#ed1c24]"
                        : "border-black focus:border-[#00a651]"
                    } text-black placeholder:text-black/40 focus:outline-none transition-all duration-200 hover:bg-black/10 focus:bg:black/10 font-medium`.replace(
                      "focus:bg:black/10",
                      "focus:bg-black/10",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            passwordStrength >= level
                              ? strengthColors[passwordStrength]
                              : "bg-black/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs text-black/70`}
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      Strength:{" "}
                      <span className="font-semibold">
                        {strengthLabels[passwordStrength]}
                      </span>
                    </p>
                  </div>
                )}

                {touched.password && errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm text-[#ed1c24] flex items-center gap-2 font-medium`}
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    <span className="font-bold">⚠</span> {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="confirmPassword"
                  className={`text-sm font-bold text:black uppercase tracking-wide`.replace(
                    "text:black",
                    "text-black",
                  )}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 transition-colors group-focus-within:text-black" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    disabled={isLoading}
                    style={{ fontFamily: "var(--font-sora)" }}
                    className={`w-full pl-12 pr-12 py-4 bg-black/5 border-2 ${
                      touched.confirmPassword && errors.confirmPassword
                        ? "border-[#ed1c24] focus:border-[#ed1c24]"
                        : "border-black focus:border-[#00a651]"
                    } text-black placeholder:text-black/40 focus:outline-none transition-all duration-200 hover:bg-black/10 focus:bg-black/10 font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm text-[#ed1c24] flex items-center gap-2 font-medium`}
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    <span className="font-bold">⚠</span>{" "}
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>

              {/* Terms Agreement */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.35, duration: 0.5 }}
                className="flex items-start gap-3 pt-2"
              >
                <input
                  type="checkbox"
                  id="terms"
                  required
                  disabled={isLoading}
                  className="w-5 h-5 border-2 border-black bg-white text-[#00a651] focus:ring-2 focus:ring-black cursor-pointer accent-[#00a651]"
                />
                <label
                  htmlFor="terms"
                  className={`text-xs text-black/70`}
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-semibold text-black hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-semibold text-black hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "8px 8px 0 0 rgba(0,0,0,1)",
                  x: 4,
                  y: 4,
                }}
                whileTap={{
                  scale: 0.98,
                  x: 8,
                  y: 8,
                  boxShadow: "4px 4px 0 0 rgba(0,0,0,1)",
                }}
                type="submit"
                disabled={isLoading}
                style={{ fontFamily: "var(--font-bricolage)" }}
                className={`w-full bg-[#00a651] text-white py-4 font-bold text-lg uppercase tracking-wider border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-[#008a44]`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* OAuth Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.45, duration: 0.5 }}
              className="mt-8 pt-8 border-t-4 border-black"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-0.5 bg-black" />
                <p
                  className={`text-xs text-black/60 uppercase tracking-wider font-bold`}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  OR
                </p>
                <div className="flex-1 h-0.5 bg-black" />
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                {/* Google OAuth Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "6px 6px 0 0 rgba(0,0,0,1)",
                    x: 3,
                    y: 3,
                  }}
                  whileTap={{
                    scale: 0.98,
                    x: 6,
                    y: 6,
                    boxShadow: "3px 3px 0 0 rgba(0,0,0,1)",
                  }}
                  type="button"
                  onClick={() => {
                    const oauthUrl = api.getOAuthUrl(
                      "google",
                      window.location.origin + "/auth/callback",
                    );
                    window.location.href = oauthUrl;
                  }}
                  disabled={isLoading}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                  className={`w-full bg-white text-black py-4 font-bold text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-black/5`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </motion.button>

                {/* Discord OAuth Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.55, duration: 0.5 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "6px 6px 0 0 rgba(0,0,0,1)",
                    x: 3,
                    y: 3,
                  }}
                  whileTap={{
                    scale: 0.98,
                    x: 6,
                    y: 6,
                    boxShadow: "3px 3px 0 0 rgba(0,0,0,1)",
                  }}
                  type="button"
                  onClick={() => {
                    const oauthUrl = api.getOAuthUrl(
                      "discord",
                      window.location.origin + "/auth/callback",
                    );
                    window.location.href = oauthUrl;
                  }}
                  disabled={isLoading}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                  className={`w-full bg-[#5865F2] text-white py-4 font-bold text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-[#4752C4]`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Continue with Discord
                </motion.button>
              </div>
            </motion.div>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="mt-8 pt-8 border-t-4 border-black text-center"
            >
              <p
                className={`text-sm text-black/60`}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Already have an account?{" "}
                <button
                  onClick={() => onNavigate("login")}
                  disabled={isLoading}
                  className={`font-bold text-black hover:underline transition-all`}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  SIGN IN
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.5 }}
        className="absolute bottom-6 left-6 right-6 lg:left-12 lg:right-12 text-center z-10"
      >
        <p
          className={`text-xs text-white/40 uppercase tracking-widest`}
          style={{ fontFamily: "var(--font-sora)" }}
        >
          © {new Date().getFullYear()} NSBE UCF Chapter
        </p>
      </motion.div>
    </div>
  );
}

