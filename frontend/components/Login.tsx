// Brutalist/Geometric Design System for NSBE UCF Login
// - Asymmetric diagonal layouts with overlapping elements
// - Distinctive typography (Bricolage Grotesque + Sora)
// - Geometric shapes, grain textures, dramatic shadows
// - High-impact animations with staggered reveals
// - Bold color usage with NSBE brand identity

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { Bricolage_Grotesque, Sora } from "next/font/google";

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

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onNavigate: (page: "signup" | "forgot-password") => void;
  isLoading?: boolean;
}

export function Login({ onLogin, onNavigate, isLoading = false }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    setErrors({ ...errors, email: validateEmail(email) });
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    setErrors({ ...errors, password: validatePassword(password) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (!emailError && !passwordError) {
      onLogin(email, password);
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
        {/* Left Side - Hero (Overlaps on diagonal) */}
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
            {/* Logo - Brutalist style */}
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

            {/* Hero Text - Bold typography */}
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
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#ed1c24] text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
                  <Zap className="w-4 h-4" />
                  <span>Welcome Back</span>
                </div>
              </motion.div>

              <h2
                className={`text-5xl lg:text-7xl xl:text-8xl font-extrabold leading-[0.95] tracking-tight`}
                style={{
                  fontFamily: "var(--font-bricolage)",
                  lineHeight: "0.95",
                }}
              >
                Track Your
                <br />
                <span className="text-[#ffb81c] relative inline-block">
                  Journey
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
                Monitor your 1-1-1 and 3-3-3 progress, stay connected with the
                NSBE community, and unlock your full potential.
              </p>
            </motion.div>

            {/* Features - Asymmetric grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-2xl"
            >
              {[
                {
                  title: "Track Progress",
                  desc: "Monitor workshops & GBMs",
                  delay: 1.0,
                  color: "bg-[#00a651]",
                },
                {
                  title: "Easy Check-In",
                  desc: "QR code scanning",
                  delay: 1.1,
                  color: "bg-[#ffb81c]",
                },
                {
                  title: "Stay Connected",
                  desc: "Never miss events",
                  delay: 1.2,
                  color: "bg-[#ed1c24]",
                  span: "col-span-1 lg:col-span-2",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30, rotate: -2 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{
                    delay: feature.delay,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    rotate: 1,
                    scale: 1.02,
                    x: 8,
                    transition: { duration: 0.2 },
                  }}
                  className={`${feature.span || ""} relative group`}
                >
                  <div
                    className={`${feature.color} p-6 shadow-[6px_6px_0_0_rgba(0,0,0,0.3)] border-4 border-black relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <h3
                        className={`text-xl font-bold mb-2 text-black`}
                        style={{ fontFamily: "var(--font-bricolage)" }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-sm text-black/70`}
                        style={{ fontFamily: "var(--font-sora)" }}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Brutalist Login Card (Overlaps left) */}
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
                SIGN IN
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className={`text-sm text-black/60 uppercase tracking-wider`}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Enter your credentials
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
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
                transition={{ delay: 1.0, duration: 0.5 }}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    disabled={isLoading}
                    style={{ fontFamily: "var(--font-sora)" }}
                    className={`w-full pl-12 pr-12 py-4 bg-black/5 border-2 ${
                      touched.password && errors.password
                        ? "border-[#ed1c24] focus:border-[#ed1c24]"
                        : "border-black focus:border-[#00a651]"
                    } text-black placeholder:text-black/40 focus:outline-none transition-all duration-200 hover:bg-black/10 focus:bg-black/10 font-medium`}
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

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="flex items-center justify-between"
              >
                <label
                  className={`flex items-center gap-2 cursor-pointer group`}
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-5 h-5 border-2 border-black bg-white text-[#00a651] focus:ring-2 focus:ring-black cursor-pointer accent-[#00a651]"
                  />
                  <span className="text-sm text-black/70 group-hover:text-black font-medium transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate("forgot-password")}
                  disabled={isLoading}
                  className={`text-sm text-black/70 hover:text-black font-bold transition-colors hover:underline`}
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  Forgot?
                </button>
              </motion.div>

              {/* Submit Button - Brutalist style */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-8 pt-8 border-t-4 border-black text-center"
            >
              <p
                className={`text-sm text-black/60`}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Don't have an account?{" "}
                <button
                  onClick={() => onNavigate("signup")}
                  disabled={isLoading}
                  className={`font-bold text-black hover:underline transition-all`}
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  CREATE ACCOUNT
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
        transition={{ delay: 1.4, duration: 0.5 }}
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
