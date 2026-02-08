// Brutalist/Geometric Design System for NSBE UCF Dashboard
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Award,
  TrendingUp,
  Zap,
  Construction,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ProgressCard } from "./ProgressCard";
import { ProgressRing } from "./ProgressRing";
import { EventCard } from "./EventCard";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";
import { Bricolage_Grotesque, Sora } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardProps {
  memberData: {
    name: string;
    email: string;
    role: string;
    totalEvents: number;
    workshopsAttended: number; // Bucket 1: WORKSHOP + SOCIAL
    gbmAttended: number; // Bucket 3: GBM
    communityServiceAttended: number; // Bucket 2: FUNDRAISER + COMMUNITY_SERVICE
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
  // Calculate progress using bucket logic (matching backend)
  // Bucket 1: Workshops & Socials (WORKSHOP + SOCIAL)
  // Bucket 2: Fundraiser & Community Service (FUNDRAISER + COMMUNITY_SERVICE)
  // Bucket 3: GBM
  const workshopsSocialsProgress = (memberData.workshopsAttended / 3) * 100;
  const gbmProgress = (memberData.gbmAttended / 3) * 100;
  const fundraiserCommunityServiceProgress = (memberData.communityServiceAttended / 3) * 100;
  const overallProgress =
    ((memberData.workshopsAttended +
      memberData.gbmAttended +
      memberData.communityServiceAttended) /
      9) *
    100;

  // Check achievements using bucket logic (matching backend)
  // 1-1-1: 1 from each bucket
  const has111 =
    memberData.workshopsAttended >= 1 && // Bucket 1: Workshops & Socials
    memberData.communityServiceAttended >= 1 && // Bucket 2: Fundraiser & Community Service
    memberData.gbmAttended >= 1; // Bucket 3: GBM
  // 3-3-3: 3 from each bucket
  const has333 =
    memberData.workshopsAttended >= 3 && // Bucket 1: Workshops & Socials
    memberData.communityServiceAttended >= 3 && // Bucket 2: Fundraiser & Community Service
    memberData.gbmAttended >= 3; // Bucket 3: GBM

  // Chart data using bucket labels (matching backend)
  const progressData = [
    { 
      category: "Workshops & Socials", 
      current: memberData.workshopsAttended, 
      target: 3 
    }, // Bucket 1: WORKSHOP + SOCIAL
    { 
      category: "GBMs", 
      current: memberData.gbmAttended, 
      target: 3 
    }, // Bucket 3: GBM
    {
      category: "Fundraiser & Comm. Serv.",
      current: memberData.communityServiceAttended,
      target: 3,
    }, // Bucket 2: FUNDRAISER + COMMUNITY_SERVICE
  ];

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
    <div
      className={`${bricolage.variable} ${sora.variable} min-h-screen relative overflow-hidden font-sans`}
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Brutalist background with geometric shapes */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Base green gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />

        {/* Diagonal geometric shapes */}
        <motion.div
          animate={{
            rotate: [0, 2, -2, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 -right-24 w-[600px] h-[600px] bg-[#ffb81c] opacity-15"
          style={{
            clipPath: "polygon(40% 0%, 100% 0%, 60% 100%, 0% 100%)",
            transform: "rotate(-15deg)",
          }}
        />
        <motion.div
          animate={{
            rotate: [0, -3, 3, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-[#ed1c24] opacity-12"
          style={{
            clipPath: "polygon(0% 0%, 60% 0%, 100% 100%, 40% 100%)",
            transform: "rotate(12deg)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 lg:p-8 space-y-6">
        {/* Welcome header - Brutalist style */}
        <motion.div
          initial={{ opacity: 0, y: -30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1
                  className={`text-4xl lg:text-5xl font-extrabold mb-3 text-black ${bricolage.className} tracking-tight`}
                >
                  Welcome back, {memberData.name?.split(" ")[0] || "Member"}!
                </h1>
                <p
                  className={`text-lg ${sora.className} text-black/70 max-w-2xl`}
                >
                  You&apos;ve attended{" "}
                  <span className="font-bold text-[#00a651]">
                    {memberData.totalEvents}
                  </span>{" "}
                  events this semester. {getEncouragementMessage()}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffb81c] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Zap className="w-4 h-4 text-black" />
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${bricolage.className} text-black`}
                >
                  Keep Growing!
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats overview - Brutalist cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Events",
              value: memberData.totalEvents,
              icon: <Calendar className="w-6 h-6" />,
              color: "#00a651",
              subtitle: "This semester",
              delay: 0.2,
            },
            {
              title: "Workshops & Socials",
              value: memberData.workshopsAttended,
              icon: <Award className="w-6 h-6" />,
              color: "#ffb81c",
              subtitle: "3 required for 3-3-3",
              delay: 0.3,
            },
            {
              title: "GBMs",
              value: memberData.gbmAttended,
              icon: <Users className="w-6 h-6" />,
              color: "#00a651",
              subtitle: "3 required for 3-3-3",
              delay: 0.4,
            },
            {
              title: "Fundraiser & Comm. Serv.",
              value: memberData.communityServiceAttended,
              icon: <TrendingUp className="w-6 h-6" />,
              color: "#ed1c24",
              subtitle: "3 required for 3-3-3",
              delay: 0.5,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: stat.delay, duration: 0.6, ease: "easeOut" }}
              whileHover={{
                rotate: 1,
                scale: 1.02,
                x: 4,
                y: -4,
                transition: { duration: 0.2 },
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
              <div
                className="relative border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                style={{ backgroundColor: stat.color }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-black/20 flex items-center justify-center border-2 border-black">
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
                <div>
                  <p
                    className={`text-sm font-bold uppercase tracking-wider mb-2 ${bricolage.className} text-black/80`}
                  >
                    {stat.title}
                  </p>
                  <p
                    className={`text-4xl font-extrabold mb-1 ${bricolage.className} text-black`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs ${sora.className} text-black/60 font-medium`}
                  >
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress overview with ring - Brutalist style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -1 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-2 relative"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
              <h3
                className={`text-black text-2xl font-extrabold mb-6 ${bricolage.className} uppercase tracking-wide`}
              >
                3-3-3 Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Workshops & Socials",
                    description: "Workshops + Social events",
                    current: memberData.workshopsAttended,
                    target: 3,
                    color: "#ffb81c",
                    icon: <Award className="w-5 h-5" />,
                  },
                  {
                    title: "GBMs",
                    description: "General Body Meetings",
                    current: memberData.gbmAttended,
                    target: 3,
                    color: "#00a651",
                    icon: <Users className="w-5 h-5" />,
                  },
                  {
                    title: "Fundraiser & Comm. Serv.",
                    description: "Fundraisers + Comm. Serv. events",
                    current: memberData.communityServiceAttended,
                    target: 3,
                    color: "#ed1c24",
                    icon: <TrendingUp className="w-5 h-5" />,
                  },
                ].map((progress, i) => (
                  <div
                    key={i}
                    className="border-2 border-black p-4 bg-black/5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 border-2 border-black flex items-center justify-center"
                        style={{ backgroundColor: progress.color }}
                      >
                        <div className="text-black">{progress.icon}</div>
                      </div>
                      <p
                        className={`text-sm font-bold uppercase ${bricolage.className} text-black`}
                        title={progress.description || ""}
                      >
                        {progress.title}
                      </p>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-2xl font-extrabold ${bricolage.className} text-black`}
                        >
                          {progress.current}
                        </span>
                        <span
                          className={`text-sm ${sora.className} text-black/50`}
                        >
                          /{progress.target}
                        </span>
                      </div>
                      <div className="w-full h-4 bg-black/10 border-2 border-black">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((progress.current / progress.target) * 100, 100)}%`,
                          }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                          className="h-full border-r-2 border-black"
                          style={{ backgroundColor: progress.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 1 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 flex flex-col items-center justify-center">
              <h4
                className={`text-black font-bold mb-4 uppercase ${bricolage.className}`}
              >
                Overall Progress
              </h4>
              <ProgressRing
                progress={overallProgress}
                size={160}
                color="#00a651"
              />
              <p
                className={`text-sm ${sora.className} text-black/70 mt-4 text-center font-medium`}
              >
                {Math.round(overallProgress)}% towards 3-3-3 goal
              </p>
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 gap-6">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
              <h4
                className={`text-black font-extrabold mb-4 uppercase ${bricolage.className}`}
              >
                Attendance by Category
              </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={progressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#000000"
                  strokeWidth={2}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="category"
                  stroke="#000000"
                  strokeWidth={2}
                  tick={{ fill: "#000000", fontSize: 12, fontWeight: "bold" }}
                  tickLine={{ stroke: "#000000", strokeWidth: 2 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 3 }}
                />
                <YAxis
                  stroke="#000000"
                  strokeWidth={2}
                  tick={{ fill: "#000000", fontSize: 12, fontWeight: "bold" }}
                  tickLine={{ stroke: "#000000", strokeWidth: 2 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 3 }}
                  domain={[0, 3]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "4px solid #000000",
                    borderRadius: "0",
                    color: "#000000",
                    fontWeight: "bold",
                    boxShadow: "4px 4px 0 0 rgba(0,0,0,1)",
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                />
                <Bar
                  dataKey="current"
                  fill="#00a651"
                  radius={[0, 0, 0, 0]}
                >
                  {progressData.map((entry, index) => (
                    <Cell
                      key={`cell-current-${index}`}
                      stroke="#000000"
                      strokeWidth={3}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="target"
                  fill="#e5e7eb"
                  radius={[0, 0, 0, 0]}
                >
                  {progressData.map((entry, index) => (
                    <Cell
                      key={`cell-target-${index}`}
                      stroke="#000000"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Upcoming events - moved up to be second main content block */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-black text-2xl font-extrabold uppercase ${bricolage.className} tracking-wide`}
              >
                Upcoming Events
              </h3>
              <button
                onClick={() => onNavigate("events")}
                className={`text-black/70 hover:text-black font-bold transition-colors text-sm ${bricolage.className} uppercase tracking-wider`}
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
                <Calendar className="w-12 h-12 text-black/30 mx-auto mb-3" />
                <p
                  className={`${sora.className} text-black/70 font-medium`}
                >
                  No upcoming events
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievements - Under Construction, moved to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-gray-100 border-4 border-black/30 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)] p-6 border-dashed">
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-black/70 text-2xl font-extrabold uppercase ${bricolage.className} tracking-wide`}
              >
                Achievements
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border-2 border-amber-600/50 text-amber-800">
                <Construction className="w-4 h-4" />
                <span
                  className={`text-xs font-bold uppercase ${bricolage.className}`}
                >
                  Under Construction
                </span>
              </div>
            </div>
            <p className={`${sora.className} text-black/60 text-sm`}>
              Achievement tracking and badges coming soon. Your progress is already being tracked!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
