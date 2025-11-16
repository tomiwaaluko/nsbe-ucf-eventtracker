import { Calendar, Plus, Bell, Filter } from "lucide-react";
import { Button } from "../ui/button";

interface NoUpcomingEventsProps {
  hasFilters?: boolean;
  isAdmin?: boolean;
  onClearFilters?: () => void;
  onCreateEvent?: () => void;
  onEnableNotifications?: () => void;
  onViewPastEvents?: () => void;
}

export function NoUpcomingEvents({
  hasFilters = false,
  isAdmin = false,
  onClearFilters,
  onCreateEvent,
  onEnableNotifications,
  onViewPastEvents,
}: NoUpcomingEventsProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30" />
          <div className="relative text-center">
            <div className="inline-block relative">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-20 w-20 text-blue-500" />
              </div>
              {hasFilters && (
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center border-4 border-white animate-bounce">
                  <Filter className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {hasFilters ? "No Events Match Your Filters" : "No Upcoming Events"}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {hasFilters
              ? "Try adjusting your filters to see more events"
              : "There are no upcoming events scheduled at this time"}
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Check Back Soon</h3>
              <p className="text-sm text-gray-600">
                New events are added regularly. Enable notifications to stay updated.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Past Events</h3>
              <p className="text-sm text-gray-600">
                Browse previous events to see what NSBE UCF has organized.
              </p>
            </div>

            {isAdmin && (
              <div className="bg-gradient-to-br from-[#00843D] to-[#006830] rounded-lg p-6 text-left md:col-span-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">You're an Admin</h3>
                <p className="text-sm text-white/90 mb-4">
                  Create the next event for your chapter members
                </p>
                <Button
                  onClick={onCreateEvent}
                  className="bg-white text-[#00843D] hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}
          </div>

          {/* What You Can Do */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-4 text-left">
              What you can do while waiting:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <p className="text-sm text-blue-800">Review your progress toward 1-1-1 and 3-3-3 goals</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <p className="text-sm text-blue-800">Browse past events and see what you missed</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">3</span>
                </div>
                <p className="text-sm text-blue-800">Update your profile information</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">4</span>
                </div>
                <p className="text-sm text-blue-800">Connect with other NSBE members</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasFilters && onClearFilters && (
              <Button
                onClick={onClearFilters}
                className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center justify-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear All Filters
              </Button>
            )}

            {!hasFilters && onEnableNotifications && (
              <Button
                onClick={onEnableNotifications}
                className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center justify-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Enable Notifications
              </Button>
            )}

            {onViewPastEvents && (
              <Button
                onClick={onViewPastEvents}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                View Past Events
              </Button>
            )}
          </div>

          {/* Season Message */}
          <div className="mt-8 p-4 bg-gradient-to-r from-[#FFD700]/20 to-[#00843D]/20 rounded-lg">
            <p className="text-sm text-gray-700">
              📚 Events typically pick up during the academic semester. We usually host workshops, GBMs, and community service events throughout the year!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
