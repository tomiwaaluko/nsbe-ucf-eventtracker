import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

interface ForgotPasswordProps {
  onSubmit: (email: string) => void;
  onNavigate: (page: "login") => void;
  isLoading?: boolean;
}

export function ForgotPassword({
  onSubmit,
  onNavigate,
  isLoading = false,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return "";
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    setError(emailError);
    setTouched(true);

    if (!emailError) {
      onSubmit(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#00843D] rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NSBE UCF</h1>
              <p className="text-sm text-gray-600">Event Tracker</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#00843D]/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-[#00843D]" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your email address and we'll send you
              instructions to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onBlur={handleBlur}
                  className={`pl-10 placeholder:text-gray-500 ${
                    touched && error
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                  }`}
                  aria-invalid={touched && !!error}
                  aria-describedby={
                    touched && error ? "email-error" : undefined
                  }
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {touched && error && (
                <p
                  id="email-error"
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  <span>⚠</span> {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00843D] hover:bg-[#006830] text-white h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending Instructions...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <button
              onClick={() => onNavigate("login")}
              className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-900 transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="mailto:support@nsbeucf.org"
              className="text-[#00843D] hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
