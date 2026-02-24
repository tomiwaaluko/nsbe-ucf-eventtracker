import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Bricolage_Grotesque, Sora } from "next/font/google";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  Construction,
  AlertTriangle,
} from "lucide-react";

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
  const [duplicateWarning, setDuplicateWarning] = useState<{ matchType: string; email?: string } | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

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
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-[#00843D]",
    "bg-[#00843D]",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Check for duplicate user before proceeding
      setIsCheckingDuplicate(true);
      setDuplicateWarning(null);

      try {
        const duplicateCheck = await api.checkDuplicateUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });

        if (duplicateCheck.exists) {
          setDuplicateWarning({
            matchType: duplicateCheck.matchType,
            email: duplicateCheck.user?.email,
          });
          setIsCheckingDuplicate(false);
          return;
        }

        // No duplicate found, proceed with signup
        const { confirmPassword, ...signUpData } = formData;
        onSignUp(signUpData);
      } catch (error) {
        console.error("Failed to check for duplicate user:", error);
        // Proceed anyway if check fails
        const { confirmPassword, ...signUpData } = formData;
        onSignUp(signUpData);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] ${bricolage.variable} ${sora.variable}`}>
      {/* Decorative Grid Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, #000 50px, #000 51px),
                           repeating-linear-gradient(90deg, transparent, transparent 50px, #000 50px, #000 51px)`
        }} />
      </div>

      {/* Grain Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl"
        >
          {/* Main Card Container */}
          <div className="relative">
            {/* Main Card */}
            <div className="relative bg-white border-4 border-black">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#00843D] to-[#006830] p-6 sm:p-8 lg:p-10 border-b-4 border-black">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-4 border-black flex items-center justify-center">
                    <span className={`text-2xl sm:text-3xl font-bold text-[#00843D] ${bricolage.className}`}>N</span>
                  </div>
                  <div>
                    <h1 className={`text-xl sm:text-2xl font-bold text-white ${bricolage.className}`}>NSBE UCF</h1>
                    <p className={`text-sm text-white/90 ${sora.className}`}>Event Tracker</p>
                  </div>
                </div>
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 ${bricolage.className}`}>
                  Join Our Community
                </h2>
                <p className={`text-base sm:text-lg text-white/90 ${sora.className}`}>
                  Start your journey with NSBE UCF and track your path to becoming a well-rounded engineer and leader.
                </p>
              </div>

              {/* Content Area */}
              <div className="p-6 sm:p-8 lg:p-10 text-black">
                <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
                  {/* Left Side - Benefits (Hidden on mobile, shown on lg+) */}
                  <div className="hidden lg:block lg:col-span-2">
                    <div className="sticky top-8">
                      <h3 className={`font-bold text-xl mb-6 ${bricolage.className}`}>What you'll get:</h3>

                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="relative"
                        >
                          <div className="relative bg-[#ffb81c]/10 border-2 border-black p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#00a651]" />
                              <div>
                                <p className={`font-semibold ${sora.className}`}>Track Your 1-1-1 Progress</p>
                                <p className={`text-sm ${sora.className}`}>
                                  1 Workshop, 1 GBM, 1 Community Service
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="relative"
                        >
                          <div className="relative bg-[#00a651]/10 border-2 border-black p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#00a651]" />
                              <div>
                                <p className={`font-semibold ${sora.className}`}>Monitor Your 3-3-3 Goals</p>
                                <p className={`text-sm ${sora.className}`}>
                                  3 Workshops, 3 GBMs, 3 Community Services
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="relative"
                        >
                          <div className="relative bg-[#ed1c24]/10 border-2 border-black p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#00a651]" />
                              <div>
                                <p className={`font-semibold ${sora.className}`}>Quick Event Check-In</p>
                                <p className={`text-sm ${sora.className}`}>
                                  Scan QR codes at events instantly
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="relative"
                        >
                          <div className="relative bg-[#ffb81c]/10 border-2 border-black p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#00a651]" />
                              <div>
                                <p className={`font-semibold ${sora.className}`}>View Event History</p>
                                <p className={`text-sm ${sora.className}`}>
                                  Keep track of all events you've attended
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Sign Up Form */}
                  <div className="lg:col-span-3">
                    <div className="mb-6">
                      <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${bricolage.className}`}>
                        Create Account
                      </h3>
                      <p className={sora.className}>
                        Fill in your information to get started
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className={`space-y-5 ${sora.className}`}>
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-black font-semibold">
                            First Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/60 z-10" />
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="John"
                              value={formData.firstName}
                              onChange={(e) => handleChange("firstName", e.target.value)}
                              onBlur={() => handleBlur("firstName")}
                              className={`pl-10 border-2 border-black relative ${
                                touched.firstName && errors.firstName
                                  ? "border-[#ed1c24] focus-visible:ring-[#ed1c24]/20"
                                  : ""
                              }`}
                              aria-invalid={touched.firstName && !!errors.firstName}
                              disabled={isLoading}
                            />
                          </div>
                          {touched.firstName && errors.firstName && (
                            <p className="text-sm text-[#ed1c24] font-medium">⚠ {errors.firstName}</p>
                          )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-black font-semibold">
                            Last Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/60 z-10" />
                            <Input
                              id="lastName"
                              type="text"
                              placeholder="Doe"
                              value={formData.lastName}
                              onChange={(e) => handleChange("lastName", e.target.value)}
                              onBlur={() => handleBlur("lastName")}
                              className={`pl-10 border-2 border-black relative ${
                                touched.lastName && errors.lastName
                                  ? "border-[#ed1c24] focus-visible:ring-[#ed1c24]/20"
                                  : ""
                              }`}
                              aria-invalid={touched.lastName && !!errors.lastName}
                              disabled={isLoading}
                            />
                          </div>
                          {touched.lastName && errors.lastName && (
                            <p className="text-sm text-[#ed1c24] font-medium">⚠ {errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-black font-semibold">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/60 z-10" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            onBlur={() => handleBlur("email")}
                            className={`pl-10 border-2 border-black relative ${
                              touched.email && errors.email
                                ? "border-[#ed1c24] focus-visible:ring-[#ed1c24]/20"
                                : ""
                            }`}
                            aria-invalid={touched.email && !!errors.email}
                            disabled={isLoading}
                          />
                        </div>
                        {touched.email && errors.email && (
                          <p className="text-sm text-[#ed1c24] font-medium">⚠ {errors.email}</p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-black font-semibold">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/60 z-10" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            onBlur={() => handleBlur("password")}
                            className={`pl-10 pr-10 border-2 border-black relative ${
                              touched.password && errors.password
                                ? "border-[#ed1c24] focus-visible:ring-[#ed1c24]/20"
                                : ""
                            }`}
                            aria-invalid={touched.password && !!errors.password}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black z-10 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
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
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className="relative flex-1"
                                >
                                  <div
                                    className={`relative h-2 border-2 border-black transition-colors ${
                                      passwordStrength >= level
                                        ? strengthColors[passwordStrength]
                                        : "bg-gray-100"
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs">
                              Strength:{" "}
                              <span className="font-bold">
                                {strengthLabels[passwordStrength]}
                              </span>
                            </p>
                          </div>
                        )}

                        {touched.password && errors.password && (
                          <p className="text-sm text-[#ed1c24] font-medium">⚠ {errors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-black font-semibold">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/60 z-10" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleChange("confirmPassword", e.target.value)
                            }
                            onBlur={() => handleBlur("confirmPassword")}
                            className={`pl-10 pr-10 border-2 border-black relative ${
                              touched.confirmPassword && errors.confirmPassword
                                ? "border-[#ed1c24] focus-visible:ring-[#ed1c24]/20"
                                : ""
                            }`}
                            aria-invalid={
                              touched.confirmPassword && !!errors.confirmPassword
                            }
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black z-10 transition-colors"
                            aria-label={
                              showConfirmPassword ? "Hide password" : "Show password"
                            }
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
                          <p className="text-sm text-[#ed1c24] font-medium">
                            ⚠ {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      {/* Terms Agreement */}
                      <div className="flex items-start gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 rounded border-2 border-black text-[#00a651] focus:ring-[#00a651]"
                          required
                          disabled={isLoading || isCheckingDuplicate}
                        />
                        <label htmlFor="terms" className="text-sm text-black">
                          I agree to the{" "}
                          <a href="#" className="text-[#00a651] hover:underline font-semibold">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-[#00a651] hover:underline font-semibold">
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      {/* Duplicate User Warning */}
                      {duplicateWarning && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative"
                        >
                          <div className="relative bg-[#ffb81c]/20 border-4 border-black p-4 flex gap-3 text-black">
                            <AlertTriangle className="h-5 w-5 text-[#ed1c24] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className={`font-bold mb-1 ${bricolage.className}`}>
                                Account Already Exists
                              </h4>
                              {duplicateWarning.matchType === 'email' ? (
                                <p className="text-sm">
                                  An account with this email address already exists. Please{" "}
                                  <button
                                    type="button"
                                    onClick={() => onNavigate("login")}
                                    className="font-bold underline hover:text-[#00a651]"
                                  >
                                    sign in
                                  </button>{" "}
                                  instead, or use the "Forgot Password" option if you don't remember your password.
                                </p>
                              ) : (
                                <p className="text-sm">
                                  A user with the name "{formData.firstName} {formData.lastName}" already exists
                                  {duplicateWarning.email && ` (${duplicateWarning.email})`}.
                                  If this is you, please{" "}
                                  <button
                                    type="button"
                                    onClick={() => onNavigate("login")}
                                    className="font-bold underline hover:text-[#00a651]"
                                  >
                                    sign in
                                  </button>{" "}
                                  or use "Forgot Password" if you don't remember your password.
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => setDuplicateWarning(null)}
                                className="text-xs text-black hover:text-[#00a651] font-bold mt-2 underline"
                              >
                                Dismiss and try anyway
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <div className="relative pt-2">
                        <Button
                          type="submit"
                          className={`w-full bg-[#00a651] hover:bg-[#008a44] text-white h-12 border-4 border-black relative font-bold text-base ${bricolage.className}`}
                          disabled={isLoading || isCheckingDuplicate}
                        >
                          {isLoading || isCheckingDuplicate ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              {isCheckingDuplicate ? "Checking..." : "Creating Account..."}
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </div>
                    </form>

                    {/* OAuth Divider */}
                    <div className="mt-6 pt-6 border-t-2 border-black border-dashed">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 h-0.5 bg-black" />
                        <p className={`text-sm font-bold ${bricolage.className}`}>OR</p>
                        <div className="flex-1 h-0.5 bg-black" />
                      </div>

                      {/* OAuth Buttons */}
                      <div className="space-y-3">
                        {/* Google OAuth Button */}
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            disabled
                            className={`w-full h-11 border-2 border-black bg-gray-100 text-gray-500 cursor-not-allowed flex items-center justify-center gap-3 relative ${sora.className}`}
                          >
                            <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24">
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
                            <span>Continue with Google</span>
                          </Button>
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="flex items-center gap-1 px-2 py-1 bg-[#ffb81c] border-2 border-black text-black">
                              <Construction className="w-3 h-3" />
                              <span className={`text-[10px] font-bold uppercase ${bricolage.className}`}>
                                WIP
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Discord OAuth Button */}
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            disabled
                            className={`w-full h-11 border-2 border-black bg-gray-100 text-gray-500 cursor-not-allowed flex items-center justify-center gap-3 relative ${sora.className}`}
                          >
                            <svg className="w-5 h-5 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0 a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            <span>Continue with Discord</span>
                          </Button>
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="flex items-center gap-1 px-2 py-1 bg-[#ffb81c] border-2 border-black text-black">
                              <Construction className="w-3 h-3" />
                              <span className={`text-[10px] font-bold uppercase ${bricolage.className}`}>
                                WIP
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                      <p className={sora.className}>
                        Already have an account?{" "}
                        <button
                          onClick={() => onNavigate("login")}
                          className={`text-[#00a651] hover:text-[#008a44] font-bold transition-colors ${bricolage.className}`}
                          disabled={isLoading}
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
