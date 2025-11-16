import { Button } from "./ui/button";
import { CheckCircle2, ArrowRight, Mail, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SuccessPageProps {
  type: "signup" | "password-reset" | "email-verified";
  onContinue: () => void;
  email?: string;
}

export function SuccessPage({ type, onContinue, email }: SuccessPageProps) {
  const configs = {
    signup: {
      icon: <Mail className="h-16 w-16 text-white" />,
      iconBg: "bg-[#00843D]",
      title: "Account Created Successfully!",
      subtitle: "Welcome to NSBE UCF Event Tracker",
      description:
        "Your account has been created and you're all set. Check your email to verify your address and get started.",
      buttonText: "Continue to Dashboard",
      benefits: [
        "Track your 1-1-1 and 3-3-3 progress",
        "Quick QR code check-in at events",
        "View your complete attendance history",
        "Stay updated on upcoming events",
      ],
    },
    "password-reset": {
      icon: <Shield className="h-16 w-16 text-white" />,
      iconBg: "bg-[#00843D]",
      title: "Password Reset Successful!",
      subtitle: "Your password has been updated",
      description:
        "You can now sign in with your new password. Make sure to keep it secure and don't share it with anyone.",
      buttonText: "Sign In Now",
      benefits: [
        "Use a password manager for security",
        "Enable two-factor authentication (coming soon)",
        "Never share your password",
        "Update your password regularly",
      ],
    },
    "email-verified": {
      icon: <Sparkles className="h-16 w-16 text-white" />,
      iconBg: "bg-[#FFD700]",
      title: "Email Verified!",
      subtitle: "Your account is now fully activated",
      description:
        "Great! Your email has been verified. You're now ready to start tracking your NSBE involvement and progress.",
      buttonText: "Start Exploring",
      benefits: [
        "Full access to all features",
        "Receive important event notifications",
        "Connect with the NSBE community",
        "Track your academic and professional growth",
      ],
    },
  };

  const config = configs[type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00843D]/5 via-white to-[#FFD700]/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
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

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-[#00843D] via-[#FFD700] to-[#DC143C]" />

          <div className="p-8 md:p-12">
            {/* Success Icon with Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div
                  className={`w-24 h-24 ${config.iconBg} rounded-full flex items-center justify-center`}
                >
                  {config.icon}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 className="h-6 w-6 text-[#00843D]" />
                </motion.div>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {config.title}
              </h2>
              <p className="text-lg text-gray-600 mb-2">{config.subtitle}</p>
              <p className="text-gray-600 max-w-lg mx-auto">
                {config.description}
              </p>
              {email && (
                <p className="mt-3 text-sm text-gray-500">
                  Account:{" "}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
              )}
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#00843D]" />
                  {type === "email-verified" ? "You can now:" : "What's next?"}
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#00843D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-[#00843D]" />
                      </div>
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onContinue}
                className="w-full bg-[#00843D] hover:bg-[#006830] text-white h-12 text-base"
              >
                {config.buttonText}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Additional Info */}
            {type === "signup" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">📧 Check your email:</span>{" "}
                  We've sent a verification link to {email}. Click it to
                  activate your account fully.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 md:px-12 py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#00843D]">500+</div>
                <div className="text-xs text-gray-600">Active Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#FFD700]">100+</div>
                <div className="text-xs text-gray-600">Events Per Year</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#DC143C]">10K+</div>
                <div className="text-xs text-gray-600">Service Hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="mailto:support@nsbeucf.org"
              className="text-[#00843D] hover:underline font-medium"
            >
              Contact Support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
