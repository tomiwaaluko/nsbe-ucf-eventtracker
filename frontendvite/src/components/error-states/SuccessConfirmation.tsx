import {
  CheckCircle2,
  Calendar,
  QrCode,
  UserPlus,
  Settings,
  Trash2,
  X,
  Share2,
} from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

interface SuccessConfirmationProps {
  type:
    | "check-in"
    | "event-created"
    | "event-updated"
    | "event-deleted"
    | "profile-updated"
    | "member-added"
    | "settings-saved"
    | "generic";
  title?: string;
  message?: string;
  details?: Array<{ label: string; value: string }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }>;
  onDismiss?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showConfetti?: boolean;
}

export function SuccessConfirmation({
  type,
  title,
  message,
  details = [],
  actions = [],
  onDismiss,
  autoClose = false,
  autoCloseDelay = 3000,
  showConfetti = false,
}: SuccessConfirmationProps) {
  const configs = {
    "check-in": {
      icon: QrCode,
      title: "Check-In Successful!",
      message: "Your attendance has been recorded",
      color: "from-[#00843D] to-[#006830]",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    "event-created": {
      icon: Calendar,
      title: "Event Created!",
      message: "Your event has been successfully created",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    "event-updated": {
      icon: Settings,
      title: "Event Updated!",
      message: "Your changes have been saved",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    "event-deleted": {
      icon: Trash2,
      title: "Event Deleted",
      message: "The event has been removed",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
    "profile-updated": {
      icon: UserPlus,
      title: "Profile Updated!",
      message: "Your profile information has been saved",
      color: "from-[#00843D] to-[#006830]",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    "member-added": {
      icon: UserPlus,
      title: "Member Added!",
      message: "New member has been successfully added",
      color: "from-[#00843D] to-[#006830]",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    "settings-saved": {
      icon: Settings,
      title: "Settings Saved!",
      message: "Your preferences have been updated",
      color: "from-[#00843D] to-[#006830]",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    generic: {
      icon: CheckCircle2,
      title: "Success!",
      message: "Action completed successfully",
      color: "from-[#00843D] to-[#006830]",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  // Auto-close logic
  if (autoClose && onDismiss) {
    setTimeout(() => {
      onDismiss();
    }, autoCloseDelay);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "linear",
              }}
              className={`absolute w-3 h-3 ${
                [
                  "bg-[#00843D]",
                  "bg-[#FFD700]",
                  "bg-purple-500",
                  "bg-blue-500",
                ][i % 4]
              }`}
              style={{
                borderRadius: Math.random() > 0.5 ? "50%" : "0%",
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative"
      >
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="relative mb-6"
        >
          <div
            className={`absolute inset-0 ${config.bgColor} rounded-full blur-2xl opacity-50`}
          />
          <div
            className={`relative w-24 h-24 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center mx-auto shadow-lg`}
          >
            <Icon className="h-12 w-12 text-white" />
          </div>
          {/* Checkmark overlay for certain types */}
          {[
            "check-in",
            "profile-updated",
            "member-added",
            "settings-saved",
          ].includes(type) && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
            >
              <CheckCircle2 className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title || config.title}
          </h2>
          <p className="text-gray-600">{message || config.message}</p>
        </div>

        {/* Details */}
        {details.length > 0 && (
          <div
            className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-6`}
          >
            <div className="space-y-2">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{detail.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className={
                  action.variant === "primary"
                    ? "w-full bg-[#00843D] hover:bg-[#006830] text-white"
                    : "w-full"
                }
                variant={action.variant === "primary" ? undefined : "outline"}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Auto-close indicator */}
        {autoClose && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Auto-closing in {Math.round(autoCloseDelay / 1000)} seconds...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                className="h-full bg-[#00843D]"
              />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Toast-style success notification
interface SuccessToastProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  onDismiss?: () => void;
}

export function SuccessToast({
  message,
  description,
  icon,
  onDismiss,
}: SuccessToastProps) {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-2xl border border-green-200 p-4 z-50"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          {icon || <CheckCircle2 className="h-5 w-5 text-green-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{message}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Banner-style success message
interface SuccessBannerProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

export function SuccessBanner({
  message,
  action,
  onDismiss,
}: SuccessBannerProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="bg-green-50 border-b border-green-200 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-900">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-green-700 hover:text-green-900 underline"
            >
              {action.label}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
