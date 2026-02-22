"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { DashboardLayout } from "./DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Trophy, Medal, TrendingUp, Users } from "lucide-react";
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

interface LeaderboardEntry {
  rank: number;
  memberId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  major?: string;
  graduationYear?: string;
  totalEventsAttended: number;
  percentile: number;
  isCurrentUser?: boolean;
}

export function LeaderboardPage() {
  // Helper function to get current semester
  const getCurrentSemester = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    // January (0) - May (4) = Spring
    // June (5) - July (6) = Summer (default to upcoming Fall)
    // August (7) - December (11) = Fall

    if (month >= 0 && month <= 4) {
      return `Spring ${year}`;
    } else if (month >= 7 && month <= 11) {
      return `Fall ${year}`;
    } else {
      // June-July, default to Fall of current year
      return `Fall ${year}`;
    }
  };

  // Generate list of recent semesters (current + last 5)
  const getSemesterOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth();

    const semesters: string[] = [];
    let year = currentYear;
    let isFall = month >= 7 && month <= 11;

    // Start with current semester
    if (month >= 0 && month <= 4) {
      // Currently Spring
      semesters.push(`Spring ${year}`);
      semesters.push(`Fall ${year - 1}`);
      year--;
    } else if (month >= 7 && month <= 11) {
      // Currently Fall
      semesters.push(`Fall ${year}`);
      semesters.push(`Spring ${year}`);
    } else {
      // June-July (summer)
      semesters.push(`Fall ${year}`);
      semesters.push(`Spring ${year}`);
    }

    // Add previous semesters
    for (let i = 0; i < 4; i++) {
      if (semesters[semesters.length - 1].startsWith('Fall')) {
        semesters.push(`Spring ${year}`);
        year--;
      } else {
        semesters.push(`Fall ${year}`);
      }
    }

    return semesters;
  };

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myPosition, setMyPosition] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [semester, setSemester] = useState<string>(getCurrentSemester());
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const currentUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {};

  useEffect(() => {
    loadLeaderboard();
  }, [semester]);

  const loadLeaderboard = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const semesterParam = semester === "all-time" || !semester ? undefined : semester;

      const [leaderboardData, positionData, statsData] = await Promise.all([
        api.getGlobalLeaderboard(token, semesterParam),
        api.getMyLeaderboardPosition(token, semesterParam),
        api.getLeaderboardStats(token, semesterParam),
      ]);

      // Mark current user in leaderboard
      const leaderboardWithUser = leaderboardData.leaderboard.map(
        (entry: LeaderboardEntry) => ({
          ...entry,
          isCurrentUser: entry.memberId === currentUser.id,
        })
      );

      setLeaderboard(leaderboardWithUser);
      setMyPosition(positionData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 border-2 border-black text-black hover:bg-yellow-500">1st Place</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 border-2 border-black text-black hover:bg-gray-400">2nd Place</Badge>;
    if (rank === 3) return <Badge className="bg-orange-600 border-2 border-black text-white hover:bg-orange-600">3rd Place</Badge>;
    if (rank <= 10) return <Badge className="border-2 border-black">Top 10</Badge>;
    return null;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className={`${bricolage.variable} ${sora.variable} space-y-6 p-4 lg:p-8`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffb81c] border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <Trophy className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h1 className={`text-3xl lg:text-4xl font-extrabold text-black ${bricolage.className} uppercase tracking-tight`}>
                    Global Leaderboard
                  </h1>
                  <p className={`text-sm lg:text-base ${sora.className} text-black/70`}>
                    Members ranked by total event attendance
                  </p>
                </div>
              </div>

              {/* Semester Filter */}
              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger className={`relative w-52 h-12 border-4 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold`}>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black">
                    {getSemesterOptions().map((sem) => (
                      <SelectItem key={sem} value={sem} className={`${bricolage.className} font-bold`}>
                        {sem}
                      </SelectItem>
                    ))}
                    <SelectItem value="all-time" className={`${bricolage.className} font-bold`}>All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Your Rank",
              value: myPosition?.rank ? `#${myPosition.rank}` : "N/A",
              subtitle: `${myPosition?.totalEventsAttended || 0} events attended`,
              color: "#00a651",
              icon: <Trophy className="w-6 h-6" />,
              delay: 0.2,
            },
            {
              title: "Total Members",
              value: stats?.totalMembers || 0,
              subtitle: `Top ${myPosition?.percentile || 0}%`,
              color: "#ffb81c",
              icon: <Users className="w-6 h-6" />,
              delay: 0.3,
            },
            {
              title: "Average Attendance",
              value: stats?.averageAttendance || 0,
              subtitle: "events per member",
              color: "#00a651",
              icon: <TrendingUp className="w-6 h-6" />,
              delay: 0.4,
            },
            {
              title: "Top Attendance",
              value: stats?.topAttendance || 0,
              subtitle: "events by #1",
              color: "#ed1c24",
              icon: <Medal className="w-6 h-6" />,
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

        {/* My Position Highlight */}
        {myPosition && myPosition.rank && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-[#00a651] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-white border-4 border-black text-black font-extrabold text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    {myPosition.rank}
                  </div>
                  <div>
                    <p className={`font-extrabold text-white text-xl ${bricolage.className} uppercase`}>
                      Your Position
                    </p>
                    <p className={`text-sm ${sora.className} text-white/90`}>
                      {myPosition.totalEventsAttended} events attended • Top {myPosition.percentile}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${sora.className} text-white/90`}>
                    {myPosition.aboveCount || 0} members ahead of you
                  </p>
                  <p className={`text-sm ${sora.className} text-white/90`}>
                    {myPosition.totalMembers - myPosition.rank} members behind you
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
            <h3 className={`text-2xl font-extrabold mb-6 uppercase ${bricolage.className} text-black`}>
              Rankings
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <motion.div
                    key={entry.memberId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * entry.rank }}
                    whileHover={{ x: 4, y: -2, transition: { duration: 0.2 } }}
                    className="relative"
                  >
                    <div
                      className={`absolute inset-0 ${
                        entry.isCurrentUser ? "bg-[#00a651]" : "bg-black"
                      } translate-x-2 translate-y-2`}
                    />
                    <div
                      className={`relative flex items-center justify-between p-4 border-4 border-black ${
                        entry.isCurrentUser
                          ? "bg-[#00a651]/10 shadow-[6px_6px_0_0_rgba(0,166,81,1)]"
                          : "bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(entry.rank) || (
                            <span className={`text-xl font-extrabold text-black ${bricolage.className}`}>
                              {entry.rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2 border-black">
                          <AvatarImage src={entry.photoUrl} />
                          <AvatarFallback className={`bg-[#00a651] text-white font-bold ${bricolage.className}`}>
                            {getInitials(entry.firstName, entry.lastName)}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-extrabold text-black ${bricolage.className}`}>
                              {entry.firstName} {entry.lastName}
                            </p>
                            {entry.isCurrentUser && (
                              <Badge className="bg-[#00a651] border-2 border-black text-white hover:bg-[#00a651]">
                                You
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm text-black/60 ${sora.className}`}>
                            {entry.major || "No major listed"}
                            {entry.graduationYear && ` • Class of ${entry.graduationYear}`}
                          </p>
                        </div>

                        {/* Events Count */}
                        <div className="text-right mr-4">
                          <p className={`text-3xl font-extrabold text-black ${bricolage.className}`}>
                            {entry.totalEventsAttended}
                          </p>
                          <p className={`text-xs text-black/60 uppercase ${bricolage.className}`}>
                            events
                          </p>
                        </div>

                        {/* Badge */}
                        <div className="w-24">{getRankBadge(entry.rank)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {leaderboard.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-black/30 mx-auto mb-4" />
                    <p className={`${sora.className} text-black/70 font-medium`}>
                      No leaderboard data available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
