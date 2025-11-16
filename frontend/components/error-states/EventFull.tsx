import { Users, Clock, Bell, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface EventFullProps {
  eventName: string;
  eventDate?: string;
  maxCapacity?: number;
  waitlistAvailable?: boolean;
  onJoinWaitlist?: () => void;
  onBrowseEvents?: () => void;
  onGoBack?: () => void;
  variant?: "full" | "closed";
}

export function EventFull({
  eventName,
  eventDate,
  maxCapacity = 50,
  waitlistAvailable = true,
  onJoinWaitlist,
  onBrowseEvents,
  onGoBack,
  variant = "full",
}: EventFullProps) {
  const isFull = variant === "full";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 ${isFull ? "bg-orange-100" : "bg-gray-200"} rounded-full blur-3xl opacity-50 animate-pulse`} />
          <div className={`relative w-32 h-32 bg-gradient-to-br ${isFull ? "from-orange-500 to-orange-600" : "from-gray-500 to-gray-600"} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
            {isFull ? (
              <Users className="h-16 w-16 text-white" />
            ) : (
              <Clock className="h-16 w-16 text-white" />
            )}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center border-4 border-white">
              <span className="text-white font-bold">✕</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isFull ? "Event is Full" : "Registration Closed"}
          </h1>
          <p className="text-lg text-gray-700 mb-2">{eventName}</p>
          {eventDate && (
            <p className="text-sm text-gray-600 mb-6">{eventDate}</p>
          )}

          {/* Event Details Card */}
          <div className={`bg-white rounded-lg border ${isFull ? "border-orange-200" : "border-gray-200"} p-6 mb-6`}>
            <div className="space-y-4">
              {isFull && (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Capacity</span>
                    <span className="font-bold text-gray-900">
                      {maxCapacity} / {maxCapacity} attendees
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-orange-500 h-3 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-sm text-gray-700">
                    This event has reached maximum capacity. {waitlistAvailable ? "Join the waitlist to be notified if spots open up." : "Please check out other upcoming events."}
                  </p>
                </>
              )}

              {!isFull && (
                <>
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Registration has closed</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    The registration period for this event has ended. Check out other upcoming events you can attend!
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Why This Happens */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💡</span>
              {isFull ? "Why events fill up:" : "About registration:"}
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              {isFull ? (
                <>
                  <p>• Popular events can reach capacity quickly</p>
                  <p>• Room size limits how many people can attend</p>
                  <p>• Early registration helps secure your spot</p>
                  <p>• Enable notifications to hear about events first</p>
                </>
              ) : (
                <>
                  <p>• Registration typically closes before the event starts</p>
                  <p>• This helps us prepare materials and seating</p>
                  <p>• Some events may allow walk-ins at the door</p>
                  <p>• Register early for future events!</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isFull && waitlistAvailable && onJoinWaitlist && (
              <Button
                onClick={onJoinWaitlist}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
              >
                <Bell className="h-5 w-5" />
                Join Waitlist
              </Button>
            )}

            {onBrowseEvents && (
              <Button
                onClick={onBrowseEvents}
                className="w-full bg-[#00843D] hover:bg-[#006830] text-white flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Browse Other Events
              </Button>
            )}

            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
          </div>

          {/* Tip */}
          <div className="mt-6 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Pro Tip:</span> Enable push notifications to get alerts when new events are posted and never miss out!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
