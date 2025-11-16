import { Calendar, Users, FileText, Search, Inbox, FolderOpen, Plus } from "lucide-react";

export function EmptyStateShowcase() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Empty States</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* No Events */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              There are no upcoming events at this time. Check back later!
            </p>
            <button className="px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830] inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          </div>

          {/* No Members */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Members Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Start inviting members to join your chapter
            </p>
            <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Invite Members
            </button>
          </div>

          {/* No Search Results */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try adjusting your search or filter to find what you're looking for
            </p>
            <button className="px-4 py-2 text-[#00843D] hover:text-[#006830] font-medium">
              Clear Filters
            </button>
          </div>

          {/* Empty Inbox */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-sm text-gray-600">
              You have no new notifications
            </p>
          </div>

          {/* No Attendance */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-sm text-gray-600 mb-4">
              Attendance records will appear here once members check in
            </p>
          </div>

          {/* Empty Folder */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Empty Folder</h3>
            <p className="text-sm text-gray-600">
              This folder contains no items
            </p>
          </div>
        </div>

        {/* Alternative Styles */}
        <div className="mt-12 space-y-8">
          <h3 className="font-semibold text-gray-900">Alternative Styles</h3>
          
          {/* Solid Background */}
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-[#00843D]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Scheduled</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first event. Members will be able to see and
              check in to events you create.
            </p>
            <button className="px-6 py-3 bg-[#00843D] text-white rounded-lg hover:bg-[#006830] inline-flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Event
            </button>
          </div>

          {/* Gradient Background */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Tracking Progress</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Once you attend events, your progress toward 1-1-1 and 3-3-3 goals will
              appear here with beautiful charts and visualizations.
            </p>
            <button className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 shadow-sm inline-flex items-center gap-2">
              Browse Upcoming Events
            </button>
          </div>

          {/* Minimal Style */}
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-semibold text-gray-900 mb-1">You're all set!</h3>
            <p className="text-sm text-gray-600">No pending tasks</p>
          </div>

          {/* With Illustration */}
          <div className="border border-gray-200 rounded-lg p-12 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00843D]/20 to-[#FFD700]/20 rounded-full" />
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl">📅</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Events</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't registered for any upcoming events. Browse our event calendar to
              find workshops, GBMs, and community service opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]">
                Browse Events
              </button>
              <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                View Calendar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
