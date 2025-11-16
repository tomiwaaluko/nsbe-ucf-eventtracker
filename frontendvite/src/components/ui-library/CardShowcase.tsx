import { Calendar, MapPin, Users, Trophy, CheckCircle2, Clock } from "lucide-react";

export function CardShowcase() {
  return (
    <div className="space-y-8">
      {/* Event Cards */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Card 1 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-purple-500" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Workshop
                </span>
                <span className="text-sm text-gray-500">Nov 22</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Resume Review Workshop</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                Get your resume reviewed by industry professionals
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>5:00 PM - 7:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Engineering Building 101</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>30 / 50 attendees</span>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]">
                Check In
              </button>
            </div>
          </div>

          {/* Event Card 2 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-2 bg-blue-500" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  GBM
                </span>
                <span className="text-sm text-gray-500">Nov 20</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fall GBM #4</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                General body meeting to discuss upcoming events
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>6:00 PM - 7:30 PM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Student Union 220</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>45 / 100 attendees</span>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]">
                Check In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Cards */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievement Cards</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border-2 border-[#FFD700] rounded-lg p-6 text-center bg-gradient-to-br from-yellow-50 to-white">
            <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-gray-900" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">3-3-3 Complete</h3>
            <p className="text-sm text-gray-600">Completed excellence goals</p>
          </div>

          <div className="border-2 border-[#00843D] rounded-lg p-6 text-center bg-gradient-to-br from-green-50 to-white">
            <div className="w-16 h-16 bg-[#00843D] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">1-1-1 Complete</h3>
            <p className="text-sm text-gray-600">Active member status</p>
          </div>

          <div className="border-2 border-purple-500 rounded-lg p-6 text-center bg-gradient-to-br from-purple-50 to-white">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Workshop Master</h3>
            <p className="text-sm text-gray-600">Attended 5+ workshops</p>
          </div>
        </div>
      </section>

      {/* Progress Cards */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Workshops</h3>
              <span className="text-2xl font-bold text-purple-600">2/3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: "66%" }} />
            </div>
            <p className="text-sm text-gray-600">1 more to complete 3-3-3</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">GBMs</h3>
              <span className="text-2xl font-bold text-blue-600">3/3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }} />
            </div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Goal completed!
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Service</h3>
              <span className="text-2xl font-bold text-green-600">3/3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }} />
            </div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Goal completed!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
