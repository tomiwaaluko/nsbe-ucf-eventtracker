export function BadgeShowcase() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges & Tags</h2>
        
        <div className="space-y-8">
          {/* Event Type Badges */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Event Type Badges</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Workshop
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                GBM
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Community Service
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                Social
              </span>
            </div>
          </div>

          {/* Status Badges */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Status Badges</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Upcoming
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Completed
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                Cancelled
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
          </div>

          {/* Solid Badges */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Solid Badges</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-[#00843D] text-white rounded-full text-sm font-medium">
                NSBE Green
              </span>
              <span className="px-3 py-1 bg-[#FFD700] text-gray-900 rounded-full text-sm font-medium">
                Gold
              </span>
              <span className="px-3 py-1 bg-[#DC143C] text-white rounded-full text-sm font-medium">
                Red
              </span>
              <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm font-medium">
                Black
              </span>
            </div>
          </div>

          {/* Badge Sizes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-0.5 bg-[#00843D] text-white rounded-full text-xs font-medium">
                Small
              </span>
              <span className="px-3 py-1 bg-[#00843D] text-white rounded-full text-sm font-medium">
                Default
              </span>
              <span className="px-4 py-1.5 bg-[#00843D] text-white rounded-full text-base font-medium">
                Large
              </span>
            </div>
          </div>

          {/* With Dots */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">With Status Dots</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Active
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                Pending
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full" />
                Inactive
              </span>
            </div>
          </div>

          {/* Outlined Badges */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Outlined</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 border-2 border-[#00843D] text-[#00843D] rounded-full text-sm font-medium">
                Green
              </span>
              <span className="px-3 py-1 border-2 border-blue-500 text-blue-600 rounded-full text-sm font-medium">
                Blue
              </span>
              <span className="px-3 py-1 border-2 border-purple-500 text-purple-600 rounded-full text-sm font-medium">
                Purple
              </span>
              <span className="px-3 py-1 border-2 border-red-500 text-red-600 rounded-full text-sm font-medium">
                Red
              </span>
            </div>
          </div>

          {/* Notification Badges */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Notification Badges</h3>
            <div className="flex flex-wrap gap-6">
              <div className="relative">
                <button className="px-4 py-2 bg-gray-100 rounded-lg">
                  Messages
                </button>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                  5
                </span>
              </div>
              
              <div className="relative">
                <button className="px-4 py-2 bg-gray-100 rounded-lg">
                  Events
                </button>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#00843D] text-white rounded-full text-xs font-bold flex items-center justify-center">
                  12
                </span>
              </div>

              <div className="relative">
                <button className="px-4 py-2 bg-gray-100 rounded-lg">
                  New
                </button>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>

          {/* Square Badges */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Square Badges</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-[#00843D] text-white rounded text-sm font-medium">
                New
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium">
                Featured
              </span>
              <span className="px-3 py-1 bg-purple-500 text-white rounded text-sm font-medium">
                Popular
              </span>
              <span className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium">
                Urgent
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
