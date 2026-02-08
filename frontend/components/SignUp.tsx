import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { api, getOAuthRedirectBase } from "@/lib/api";

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-2/5 bg-gradient-to-br from-[#00843D] to-[#006830] p-8 lg:p-12 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-[#00843D]">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">NSBE UCF</h1>
              <p className="text-sm text-white/80">Event Tracker</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Join Our Community
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Start your journey with NSBE UCF and track your path to becoming a
              well-rounded engineer and leader.
            </p>

            <div className="space-y-6 bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-lg">What you'll get:</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Track Your 1-1-1 Progress</p>
                    <p className="text-sm text-white/80">
                      1 Workshop, 1 GBM, 1 Community Service
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Monitor Your 3-3-3 Goals</p>
                    <p className="text-sm text-white/80">
                      3 Workshops, 3 GBMs, 3 Community Services
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Quick Event Check-In</p>
                    <p className="text-sm text-white/80">
                      Scan QR codes at events instantly
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">View Event History</p>
                    <p className="text-sm text-white/80">
                      Keep track of all events you've attended
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="text-sm text-white/60">
            © 2024 NSBE UCF Chapter. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="lg:w-3/5 bg-white flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Fill in your information to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    className={`pl-10 ${
                      touched.firstName && errors.firstName
                        ? "border-red-500 focus-visible:ring-red-500/20"
                        : ""
                    }`}
                    aria-invalid={touched.firstName && !!errors.firstName}
                    disabled={isLoading}
                  />
                </div>
                {touched.firstName && errors.firstName && (
                  <p className="text-sm text-red-600">⚠ {errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    className={`pl-10 ${
                      touched.lastName && errors.lastName
                        ? "border-red-500 focus-visible:ring-red-500/20"
                        : ""
                    }`}
                    aria-invalid={touched.lastName && !!errors.lastName}
                    disabled={isLoading}
                  />
                </div>
                {touched.lastName && errors.lastName && (
                  <p className="text-sm text-red-600">⚠ {errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`pl-10 placeholder:text-gray-500 ${
                    touched.email && errors.email
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                  }`}
                  aria-invalid={touched.email && !!errors.email}
                  disabled={isLoading}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-sm text-red-600">⚠ {errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`pl-10 pr-10 ${
                    touched.password && errors.password
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                  }`}
                  aria-invalid={touched.password && !!errors.password}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength >= level
                            ? strengthColors[passwordStrength]
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Strength:{" "}
                    <span className="font-medium">
                      {strengthLabels[passwordStrength]}
                    </span>
                  </p>
                </div>
              )}

              {touched.password && errors.password && (
                <p className="text-sm text-red-600">⚠ {errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`pl-10 pr-10 ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500/20"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                <p className="text-sm text-red-600">
                  ⚠ {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-gray-300 text-[#00843D] focus:ring-[#00843D]"
                required
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-[#00843D] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#00843D] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#00843D] hover:bg-[#006830] text-white h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* OAuth Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-300" />
              <p className="text-sm text-gray-500 font-medium">OR</p>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const oauthUrl = api.getOAuthUrl("google", getOAuthRedirectBase() + "/auth/callback");
                  window.location.href = oauthUrl;
                }}
                disabled={isLoading}
                className="w-full h-11 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
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
              </Button>

              {/* Discord OAuth Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const oauthUrl = api.getOAuthUrl("discord", getOAuthRedirectBase() + "/auth/callback");
                  window.location.href = oauthUrl;
                }}
                disabled={isLoading}
                className="w-full h-11 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Continue with Discord
              </Button>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => onNavigate("login")}
                className="text-[#00843D] hover:text-[#006830] font-medium transition-colors"
                disabled={isLoading}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
