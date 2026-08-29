import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ResetPasswordProps {
  onNavigate: (page: "login") => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const establishRecoverySession = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        // PKCE: exchange ?code= for a session (client-initiated reset flows)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!cancelled) {
            window.history.replaceState(null, "", window.location.pathname);
            setSessionReady(true);
          }
          return;
        }

        // Implicit: set session from hash tokens (admin/API-initiated reset)
        if (accessToken && refreshToken && type === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (!cancelled) {
            window.history.replaceState(null, "", window.location.pathname);
            setSessionReady(true);
          }
          return;
        }

        // detectSessionInUrl may already have consumed the hash/code
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          if (!cancelled) setSessionReady(true);
          return;
        }

        if (!cancelled) setTokenError(true);
      } catch (err) {
        console.error("Failed to establish recovery session:", err);
        if (!cancelled) setTokenError(true);
      }
    };

    establishRecoverySession();

    return () => {
      cancelled = true;
    };
  }, []);

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Must contain a lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Must contain an uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Must contain a number";
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    setErrors({ ...errors, password: validatePassword(password) });
  };

  const handleConfirmPasswordBlur = () => {
    setTouched({ ...touched, confirmPassword: true });
    setErrors({
      ...errors,
      confirmPassword: validateConfirmPassword(confirmPassword),
    });
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

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = [
    "",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-[#00843D]",
    "bg-[#00843D]",
  ];

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One lowercase letter", met: /(?=.*[a-z])/.test(password) },
    { label: "One uppercase letter", met: /(?=.*[A-Z])/.test(password) },
    { label: "One number", met: /(?=.*\d)/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });
    setTouched({ password: true, confirmPassword: true });

    if (!passwordError && !confirmPasswordError) {
      setIsLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error(
            "Your reset link is invalid or has expired. Please request a new one."
          );
        }

        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        // Clear recovery session so the user signs in fresh with the new password
        await supabase.auth.signOut();
        localStorage.removeItem("token");

        setSuccess(true);

        setTimeout(() => {
          onNavigate("login");
        }, 3000);
      } catch (err: any) {
        setErrors({
          password:
            err.message || "Failed to reset password. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
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

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request
              a new password reset email.
            </p>
            <Button
              onClick={() => onNavigate("login")}
              className="w-full bg-[#00843D] hover:bg-[#006830] text-white h-11"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00843D] mx-auto" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
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

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your password has been successfully updated.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
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

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#00843D]/10 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-[#00843D]" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h2>
            <p className="text-gray-600">
              Enter a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  className={`pl-10 pr-10 ${
                    touched.password && errors.password
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                  }`}
                  aria-invalid={touched.password && !!errors.password}
                  disabled={isLoading}
                  autoFocus
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

              {password && (
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

            {password && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Password must contain:
                </p>
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met ? "bg-[#00843D]" : "bg-gray-300"
                      }`}
                    >
                      {req.met && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        req.met ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={handleConfirmPasswordBlur}
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
              {password &&
                confirmPassword &&
                !errors.confirmPassword &&
                confirmPassword === password && (
                  <p className="text-sm text-[#00843D] flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Passwords match
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
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-[#00843D] hover:underline"
              disabled={isLoading}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
