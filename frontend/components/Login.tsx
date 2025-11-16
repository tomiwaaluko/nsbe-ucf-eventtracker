import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onNavigate: (page: "signup" | "forgot-password") => void;
  isLoading?: boolean;
}

export function Login({ onLogin, onNavigate, isLoading = false }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#00843D] to-[#006830] p-8 lg:p-12 flex flex-col justify-between text-white">
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
              Welcome Back
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Track your journey to excellence. Monitor your 1-1-1 and 3-3-3
              progress and stay connected with the NSBE community.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Your Progress</h3>
                  <p className="text-sm text-white/80">
                    Monitor workshops, GBMs, and community service
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Check-In</h3>
                  <p className="text-sm text-white/80">
                    Quick QR code scanning for event attendance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Stay Connected</h3>
                  <p className="text-sm text-white/80">
                    Never miss an important NSBE event
                  </p>
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

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`pl-10 placeholder:text-gray-500 ${
                    touched.email && errors.email
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                  }`}
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={
                    touched.email && errors.email ? "email-error" : undefined
                  }
                  disabled={isLoading}
                />
              </div>
              {touched.email && errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  <span className="text-red-600">⚠</span> {errors.email}
                </p>
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  className={`pl-10 pr-10 ${
                    touched.password && errors.password
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                  }`}
                  aria-invalid={touched.password && !!errors.password}
                  aria-describedby={
                    touched.password && errors.password
                      ? "password-error"
                      : undefined
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              {touched.password && errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  <span className="text-red-600">⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#00843D] focus:ring-[#00843D]"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-sm text-[#00843D] hover:text-[#006830] font-medium transition-colors"
                disabled={isLoading}
              >
                Forgot password?
              </button>
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => onNavigate("signup")}
                className="text-[#00843D] hover:text-[#006830] font-medium transition-colors"
                disabled={isLoading}
              >
                Create Account
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
