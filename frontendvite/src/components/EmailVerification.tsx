import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onResendEmail: () => void;
  onVerified: () => void;
  onChangeEmail: () => void;
  isLoading?: boolean;
  isVerifying?: boolean;
}

export function EmailVerification({
  email,
  onResendEmail,
  onVerified,
  onChangeEmail,
  isLoading = false,
  isVerifying = false,
}: EmailVerificationProps) {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    onResendEmail();
    setResendCooldown(60);
    setShowResendSuccess(true);
    setTimeout(() => setShowResendSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00843D]/5 to-white p-4">
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
          {isVerifying ? (
            // Verifying State
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#00843D]/10 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-[#00843D] animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          ) : (
            <>
              {/* Icon with Animation */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-[#00843D]/10 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-[#00843D]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <span className="text-xs">✉️</span>
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                <p className="text-gray-600">
                  We've sent a verification link to
                </p>
                <p className="font-medium text-gray-900 mt-1">{email}</p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#00843D] flex-shrink-0">1.</span>
                    <span>Check your inbox for an email from NSBE UCF Event Tracker</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#00843D] flex-shrink-0">2.</span>
                    <span>Click the verification link in the email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#00843D] flex-shrink-0">3.</span>
                    <span>You'll be automatically redirected to continue</span>
                  </li>
                </ol>
              </div>

              {/* Resend Success Message */}
              {showResendSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Verification email sent successfully!</span>
                </div>
              )}

              {/* Resend Email */}
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600">
                  Didn't receive the email?
                </p>
                <Button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Change Email */}
              <button
                onClick={onChangeEmail}
                className="w-full text-center text-sm text-[#00843D] hover:text-[#006830] font-medium transition-colors"
                disabled={isLoading}
              >
                Change Email Address
              </button>
            </>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Tips:</h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• The verification link expires in 24 hours</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
        </div>

        {/* Support Contact */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a href="mailto:support@nsbeucf.org" className="text-[#00843D] hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
