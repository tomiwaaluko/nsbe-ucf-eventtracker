import { XCircle, AlertTriangle, QrCode, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface CheckInFailedProps {
  errorType?: "invalid-code" | "wrong-event" | "already-checked-in" | "event-not-started" | "event-ended";
  onTryAgain?: () => void;
  onGoBack?: () => void;
  eventName?: string;
}

export function CheckInFailed({
  errorType = "invalid-code",
  onTryAgain,
  onGoBack,
  eventName,
}: CheckInFailedProps) {
  const errorMessages = {
    "invalid-code": {
      title: "Invalid QR Code",
      description: "This QR code is not valid for event check-in",
      detail: "Please scan the official event QR code provided by the event organizer.",
      color: "red",
    },
    "wrong-event": {
      title: "Wrong Event",
      description: `This QR code is for ${eventName || "a different event"}`,
      detail: "Make sure you're scanning the correct QR code for the event you want to check into.",
      color: "orange",
    },
    "already-checked-in": {
      title: "Already Checked In",
      description: "You've already checked into this event",
      detail: "Your attendance has been recorded. No need to check in again!",
      color: "blue",
    },
    "event-not-started": {
      title: "Event Not Started",
      description: "Check-in is not available yet",
      detail: "Check-in will open 15 minutes before the event starts. Please try again later.",
      color: "yellow",
    },
    "event-ended": {
      title: "Event Has Ended",
      description: "Check-in is no longer available",
      detail: "This event has already ended. You can no longer check in.",
      color: "gray",
    },
  };

  const error = errorMessages[errorType];
  const colorClasses = {
    red: {
      bg: "from-red-500 to-red-600",
      light: "bg-red-100",
      text: "text-red-600",
      border: "border-red-200",
    },
    orange: {
      bg: "from-orange-500 to-orange-600",
      light: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-200",
    },
    blue: {
      bg: "from-blue-500 to-blue-600",
      light: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    yellow: {
      bg: "from-yellow-500 to-yellow-600",
      light: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    gray: {
      bg: "from-gray-500 to-gray-600",
      light: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
    },
  };

  const colors = colorClasses[error.color as keyof typeof colorClasses];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 ${colors.light} rounded-full blur-3xl opacity-50 animate-pulse`} />
          <div className={`relative w-32 h-32 bg-gradient-to-br ${colors.bg} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
            {errorType === "already-checked-in" ? (
              <AlertTriangle className="h-16 w-16 text-white" />
            ) : (
              <XCircle className="h-16 w-16 text-white" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{error.title}</h1>
          <p className="text-lg text-gray-700 mb-2">{error.description}</p>
          <p className="text-sm text-gray-600 mb-6">{error.detail}</p>

          {/* Info Card */}
          <div className={`bg-white rounded-lg border ${colors.border} p-6 mb-6 text-left`}>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              What to do:
            </h3>
            <div className="space-y-2">
              {errorType === "invalid-code" && (
                <>
                  <p className="text-sm text-gray-700">• Make sure the QR code is from an NSBE UCF event</p>
                  <p className="text-sm text-gray-700">• Check if the code is clearly visible and not damaged</p>
                  <p className="text-sm text-gray-700">• Ask an event officer for assistance</p>
                </>
              )}
              {errorType === "wrong-event" && (
                <>
                  <p className="text-sm text-gray-700">• Verify you're at the correct event</p>
                  <p className="text-sm text-gray-700">• Look for the QR code displayed at the current event</p>
                  <p className="text-sm text-gray-700">• Contact the event host if you're unsure</p>
                </>
              )}
              {errorType === "already-checked-in" && (
                <>
                  <p className="text-sm text-gray-700">• Your attendance has been recorded</p>
                  <p className="text-sm text-gray-700">• You can view your check-in in your profile</p>
                  <p className="text-sm text-gray-700">• Enjoy the event!</p>
                </>
              )}
              {errorType === "event-not-started" && (
                <>
                  <p className="text-sm text-gray-700">• Wait until check-in opens (15 min before start)</p>
                  <p className="text-sm text-gray-700">• Enable notifications to get reminded</p>
                  <p className="text-sm text-gray-700">• Browse other upcoming events in the meantime</p>
                </>
              )}
              {errorType === "event-ended" && (
                <>
                  <p className="text-sm text-gray-700">• Check-in closes when the event ends</p>
                  <p className="text-sm text-gray-700">• Contact an officer if you attended but couldn't check in</p>
                  <p className="text-sm text-gray-700">• Look for upcoming events to attend</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {(errorType === "invalid-code" || errorType === "wrong-event") && onTryAgain && (
              <Button
                onClick={onTryAgain}
                className="w-full bg-[#00843D] hover:bg-[#006830] text-white"
              >
                Scan Another Code
              </Button>
            )}
            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {errorType === "already-checked-in" ? "Continue" : "Go Back"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
