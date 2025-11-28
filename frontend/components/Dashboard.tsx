import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ProgressCard } from "./ProgressCard";
import { ProgressRing } from "./ProgressRing";
import { AchievementBadge } from "./AchievementBadge";
import { EventCard } from "./EventCard";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {
  memberData: {
    name: string;
    email: string;
    role: string;
    totalEvents: number;
    workshopsAttended: number;
    gbmAttended: number;
    communityServiceAttended: number;
  };
  attendanceRecords: any[];
  upcomingEvents: any[];
  onViewEvent: (eventId: string) => void;
  onNavigate: (page: string) => void;
}

export function Dashboard({
  memberData,
  attendanceRecords,
  upcomingEvents,
  onViewEvent,
  onNavigate,
}: DashboardProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Calculate progress
  const workshopProgress = (memberData.workshopsAttended / 3) * 100;
  const gbmProgress = (memberData.gbmAttended / 3) * 100;
  const communityProgress = (memberData.communityServiceAttended / 3) * 100;
  const overallProgress =
    ((memberData.workshopsAttended +
      memberData.gbmAttended +
      memberData.communityServiceAttended) /
      9) *
    100;

  // Check achievements
  const has111 =
    memberData.workshopsAttended >= 1 &&
    memberData.gbmAttended >= 1 &&
    memberData.communityServiceAttended >= 1;
  const has333 =
    memberData.workshopsAttended >= 3 &&
    memberData.gbmAttended >= 3 &&
    memberData.communityServiceAttended >= 3;

  // Chart data
  const progressData = [
    { category: "Workshops", current: memberData.workshopsAttended, target: 3 },
    { category: "GBMs", current: memberData.gbmAttended, target: 3 },
    {
      category: "Community",
      current: memberData.communityServiceAttended,
      target: 3,
    },
  ];

  // Activity heatmap data - generate from actual attendance records
  const months = [
    "August 2024",
    "September 2024",
    "October 2024",
    "November 2024",
    "December 2024",
  ];

  const allHeatmapData = useMemo(() => {
    const daysInMonth = [31, 30, 31, 30, 31];
    const monthNames = [
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Create a Set of dates when user attended events
    const attendedDates = new Set(
      attendanceRecords.map((record) => {
        const date = new Date(record.checkedInAt);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      })
    );

    return months.map((month, monthIndex) => {
      const data = [];
      const numDays = daysInMonth[monthIndex];
      const monthNumber = 8 + monthIndex; // August = 8, September = 9, etc.

      for (let day = 1; day <= numDays; day++) {
        const dateKey = `2024-${monthNumber}-${day}`;
        const hasEvent = attendedDates.has(dateKey) ? 1 : 0;
        data.push({
          day,
          hasEvent,
          date: `${monthNames[monthIndex]} ${day}`,
        });
      }
      return data;
    });
  }, [attendanceRecords]);

  const getHeatmapColor = (hasEvent: number) => {
    return hasEvent === 1 ? "#00a651" : "#e5e7eb";
  };

  // Dynamic encouragement message based on total events
  const getEncouragementMessage = () => {
    const total = memberData.totalEvents;
    if (total <= 2) {
      return "Let's get you to more events! Every event is a step toward your goals.";
    } else if (total <= 4) {
      return "Keep up the great work!";
    } else if (total <= 7) {
      return "You're doing amazing! Your dedication is truly impressive.";
    } else {
      return "Outstanding commitment! You're a shining example of NSBE excellence. 🌟";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830]">
        {/* Animated orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-[#ffb81c] rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-[#ed1c24] rounded-full blur-3xl opacity-20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 lg:p-8 space-y-6">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-white border border-white/20 shadow-2xl"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Welcome back, {memberData.name?.split(" ")[0] || "Member"}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                You&apos;ve attended {memberData.totalEvents} events this
                semester. {getEncouragementMessage()}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-[#ffb81c]" />
              <span className="text-sm font-medium">Keep Growing!</span>
            </div>
          </div>
        </motion.div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Events",
              value: memberData.totalEvents,
              icon: <Calendar className="w-6 h-6" />,
              color: "#00a651",
              subtitle: "This semester",
              delay: 0.1,
            },
            {
              title: "Workshops",
              value: memberData.workshopsAttended,
              icon: <Award className="w-6 h-6" />,
              color: "#ffb81c",
              subtitle: "3 required for 3-3-3",
              delay: 0.2,
            },
            {
              title: "GBMs",
              value: memberData.gbmAttended,
              icon: <Users className="w-6 h-6" />,
              color: "#00a651",
              subtitle: "3 required for 3-3-3",
              delay: 0.3,
            },
            {
              title: "Community Service",
              value: memberData.communityServiceAttended,
              icon: <TrendingUp className="w-6 h-6" />,
              color: "#ed1c24",
              subtitle: "3 required for 3-3-3",
              delay: 0.4,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Progress overview with ring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
          >
            <h3 className="text-white text-xl font-bold mb-6">
              3-3-3 Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProgressCard
                title="Workshops"
                current={memberData.workshopsAttended}
                target={3}
                category="workshops"
                color="#ffb81c"
                icon={<Award className="w-6 h-6" />}
              />
              <ProgressCard
                title="GBMs"
                current={memberData.gbmAttended}
                target={3}
                category="gbm"
                color="#00a651"
                icon={<Users className="w-6 h-6" />}
              />
              <ProgressCard
                title="Community"
                current={memberData.communityServiceAttended}
                target={3}
                category="community"
                color="#ed1c24"
                icon={<TrendingUp className="w-6 h-6" />}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl flex flex-col items-center justify-center hover:bg-white/15 transition-all duration-300"
          >
            <h4 className="text-white font-semibold mb-4">Overall Progress</h4>
            <ProgressRing
              progress={overallProgress}
              size={160}
              color="#00a651"
            />
            <p className="text-sm text-white/70 mt-4 text-center">
              {Math.round(overallProgress)}% towards 3-3-3 goal
            </p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
          >
            <h4 className="text-white font-semibold mb-4">
              Attendance by Category
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "0.75rem",
                    color: "white",
                  }}
                />
                <Bar dataKey="current" fill="#00a651" radius={[8, 8, 0, 0]} />
                <Bar
                  dataKey="target"
                  fill="rgba(255,255,255,0.2)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">My Event Activity</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))
                  }
                  disabled={currentMonthIndex === 0}
                  className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="text-sm text-white/80 min-w-[120px] text-center">
                  {months[currentMonthIndex]}
                </span>
                <button
                  onClick={() =>
                    setCurrentMonthIndex(
                      Math.min(months.length - 1, currentMonthIndex + 1)
                    )
                  }
                  disabled={currentMonthIndex === months.length - 1}
                  className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-x-0.5 gap-y-2">
                {allHeatmapData[currentMonthIndex].map((item) => (
                  <div
                    key={item.day}
                    className="w-10 h-10 rounded-sm relative group cursor-pointer transition-all hover:ring-2 hover:ring-white/50 hover:scale-110"
                    style={{
                      backgroundColor: getHeatmapColor(item.hasEvent),
                    }}
                    title={`${item.date}: ${
                      item.hasEvent ? "Event attended" : "No event"
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {item.day}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#e5e7eb]" />
                  <span className="text-xs text-white/70">No event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#00a651]" />
                  <span className="text-xs text-white/70">Event attended</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-xl font-bold">Achievements</h3>
            <button
              onClick={() => onNavigate("achievements")}
              className="text-white/80 hover:text-white font-medium transition-colors text-sm"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AchievementBadge
              title="1-1-1 Complete"
              description="Attended 1 of each event type"
              unlocked={has111}
              icon={<Award className="w-8 h-8" />}
              color="#00a651"
            />
            <AchievementBadge
              title="3-3-3 Complete"
              description="Attended 3 of each event type"
              unlocked={has333}
              icon={<Award className="w-8 h-8" />}
              color="#ffb81c"
            />
            <AchievementBadge
              title="First Event"
              description="Attended your first NSBE event"
              unlocked={memberData.totalEvents > 0}
              icon={<Calendar className="w-8 h-8" />}
              color="#ed1c24"
            />
            <AchievementBadge
              title="Super Active"
              description="Attended 10+ events"
              unlocked={memberData.totalEvents >= 10}
              icon={<TrendingUp className="w-8 h-8" />}
              color="#00a651"
            />
          </div>
        </motion.div>

        {/* Upcoming events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-xl font-bold">Upcoming Events</h3>
            <button
              onClick={() => onNavigate("events")}
              className="text-white/80 hover:text-white font-medium transition-colors text-sm"
            >
              View All →
            </button>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={onViewEvent}
                  showCheckIn={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70">No upcoming events</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
