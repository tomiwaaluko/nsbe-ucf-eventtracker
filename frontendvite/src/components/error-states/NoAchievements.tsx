import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";

interface NoAchievementsProps {
  onBrowseEvents?: () => void;
  memberName?: string;
}

export function NoAchievements({ onBrowseEvents, memberName }: NoAchievementsProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Animated Trophy Illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 to-[#00843D]/20 rounded-full blur-3xl opacity-50" />
          <div className="relative text-center">
            <div className="inline-block relative">
              <div className="w-48 h-48 bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-dashed border-[#FFD700]/30">
                <Trophy className="h-24 w-24 text-[#FFD700]/40" />
              </div>
              {/* Floating particles */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="absolute top-10 right-0 w-2 h-2 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="absolute bottom-10 left-10 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Journey{memberName ? `, ${memberName}` : ""}!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your achievement cabinet is empty, but that's about to change! Attend events to unlock badges and track your progress.
          </p>

          {/* Achievement Goals Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 1-1-1 Goal */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-left hover:border-[#00843D] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#00843D] to-[#006830] rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1-1-1</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Active Member</h3>
                  <p className="text-sm text-gray-500">Basic goal</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Complete <strong>1 Workshop</strong>, <strong>1 GBM</strong>, and <strong>1 Community Service</strong> event
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">0/1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">0/1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">0/1</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-[#00843D]" />
                  <span className="text-gray-600">Unlock: <strong>Active Member Badge</strong></span>
                </div>
              </div>
            </div>

            {/* 3-3-3 Goal */}
            <div className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 rounded-xl border-2 border-[#FFD700]/30 p-6 text-left hover:border-[#FFD700] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">3-3-3</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Excellence</h3>
                  <p className="text-sm text-gray-500">Advanced goal</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Complete <strong>3 Workshops</strong>, <strong>3 GBMs</strong>, and <strong>3 Community Service</strong> events
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">0/3</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">0/3</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">0/3</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#FFD700]/20">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-[#FFD700]" />
                  <span className="text-gray-700">Unlock: <strong>Excellence Badge</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* How to Get Started */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
              <Target className="h-6 w-6 text-[#00843D]" />
              How to Earn Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Find Events</h4>
                <p className="text-sm text-gray-600">
                  Browse upcoming workshops, GBMs, and service events
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Check In</h4>
                <p className="text-sm text-gray-600">
                  Scan the QR code at the event to mark your attendance
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Earn Badges</h4>
                <p className="text-sm text-gray-600">
                  Track progress and unlock achievements automatically
                </p>
              </div>
            </div>
          </div>

          {/* Available Achievements Preview */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Achievements You Can Unlock
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🎓</div>
                <p className="text-xs font-medium text-gray-900">Workshop Master</p>
                <p className="text-xs text-gray-500">5 workshops</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🤝</div>
                <p className="text-xs font-medium text-gray-900">Community Hero</p>
                <p className="text-xs text-gray-500">5 service events</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-xs font-medium text-gray-900">Regular Member</p>
                <p className="text-xs text-gray-500">All GBMs</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-xs font-medium text-gray-900">Overachiever</p>
                <p className="text-xs text-gray-500">Double 3-3-3</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          {onBrowseEvents && (
            <Button
              onClick={onBrowseEvents}
              className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-6 text-lg"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Browse Upcoming Events
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
