// GitHub Copilot: Restyle the Achievements page to showcase badges and milestones.
// Requirements:
// - Use the same NSBE gradient background and glass cards as Login.
// - Show achievements in a responsive grid of cards with icons/emoji, title, and short description.
// - Locked vs unlocked should be visually distinct (opacity, grayscale, or overlay).
// - Add a subtle "pop" animation on hover for unlocked achievements.
// - Keep achievement data and logic intact; only update Tailwind classes and layout.

import { motion } from "framer-motion";
import {
  Award,
  Trophy,
  Star,
  CheckCircle2,
  Lock,
  Calendar,
  Users,
  Heart,
  Sparkles,
} from "lucide-react";

interface AchievementsPageProps {
  memberData: {
    workshopsAttended: number;
    gbmAttended: number;
    communityServiceAttended: number;
    totalEvents: number;
    attendanceHistory: Array<{
      eventCategory: "GBM" | "SOCIAL_AEX" | "COMMUNITY_SERVICE";
    }>;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Award;
  color: string;
  gradient: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedDate?: string;
}

export function AchievementsPage({ memberData }: AchievementsPageProps) {
  const has111 =
    memberData.workshopsAttended >= 1 &&
    memberData.gbmAttended >= 1 &&
    memberData.communityServiceAttended >= 1;

  const has333 =
    memberData.workshopsAttended >= 3 &&
    memberData.gbmAttended >= 3 &&
    memberData.communityServiceAttended >= 3;

  const achievements: Achievement[] = [
    {
      id: "111",
      title: "1-1-1 Achievement",
      description: "Attend 1 Workshop, 1 GBM, and 1 Community Service event",
      icon: Star,
      color: "text-purple-600",
      gradient: "from-purple-500 to-purple-600",
      unlocked: has111,
      progress: Math.min(
        memberData.workshopsAttended,
        memberData.gbmAttended,
        memberData.communityServiceAttended
      ),
      maxProgress: 1,
      unlockedDate: has111 ? "November 8, 2024" : undefined,
    },
    {
      id: "333",
      title: "3-3-3 Achievement",
      description: "Attend 3 Workshops, 3 GBMs, and 3 Community Service events",
      icon: Trophy,
      color: "text-yellow-600",
      gradient: "from-yellow-500 to-yellow-600",
      unlocked: has333,
      progress: Math.min(
        memberData.workshopsAttended,
        memberData.gbmAttended,
        memberData.communityServiceAttended
      ),
      maxProgress: 3,
      unlockedDate: has333 ? "November 15, 2024" : undefined,
    },
    {
      id: "first-event",
      title: "First Steps",
      description: "Attend your first NSBE UCF event",
      icon: CheckCircle2,
      color: "text-green-600",
      gradient: "from-green-500 to-green-600",
      unlocked: memberData.totalEvents > 0,
      unlockedDate:
        memberData.totalEvents > 0 ? "September 5, 2024" : undefined,
    },
    {
      id: "five-events",
      title: "Regular Attendee",
      description: "Attend 5 events total",
      icon: Calendar,
      color: "text-blue-600",
      gradient: "from-blue-500 to-blue-600",
      unlocked: memberData.totalEvents >= 5,
      progress: memberData.totalEvents,
      maxProgress: 5,
      unlockedDate:
        memberData.totalEvents >= 5 ? "October 15, 2024" : undefined,
    },
    {
      id: "ten-events",
      title: "Dedicated Member",
      description: "Attend 10 events total",
      icon: Award,
      color: "text-indigo-600",
      gradient: "from-indigo-500 to-indigo-600",
      unlocked: memberData.totalEvents >= 10,
      progress: memberData.totalEvents,
      maxProgress: 10,
      unlockedDate:
        memberData.totalEvents >= 10 ? "November 16, 2024" : undefined,
    },
    {
      id: "service-champion",
      title: "Service Champion",
      description: "Attend 5 community service events",
      icon: Heart,
      color: "text-red-600",
      gradient: "from-red-500 to-red-600",
      unlocked: memberData.communityServiceAttended >= 5,
      progress: memberData.communityServiceAttended,
      maxProgress: 5,
    },
    {
      id: "workshop-warrior",
      title: "Workshop Warrior",
      description: "Attend 5 workshops",
      icon: Award,
      color: "text-orange-600",
      gradient: "from-orange-500 to-orange-600",
      unlocked: memberData.workshopsAttended >= 5,
      progress: memberData.workshopsAttended,
      maxProgress: 5,
    },
    {
      id: "gbm-regular",
      title: "GBM Regular",
      description: "Attend 5 General Body Meetings",
      icon: Users,
      color: "text-cyan-600",
      gradient: "from-cyan-500 to-cyan-600",
      unlocked: memberData.gbmAttended >= 5,
      progress: memberData.gbmAttended,
      maxProgress: 5,
    },
  ];

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left max-w-7xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">Achievements</h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-[#ffb81c]" />
                  <span className="text-sm font-medium text-white">
                    Track Progress
                  </span>
                </div>
              </div>
              <p className="text-white/90">
                Unlock rewards and track your NSBE journey
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl"
            >
              <p className="text-white/80 text-sm mb-1">Total Events</p>
              <p className="text-3xl font-bold text-white">
                {memberData.totalEvents}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl"
            >
              <p className="text-white/80 text-sm mb-1">Unlocked</p>
              <p className="text-3xl font-bold text-white">
                {unlockedAchievements.length}/{achievements.length}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl"
            >
              <p className="text-white/80 text-sm mb-1">1-1-1</p>
              <p className="text-3xl font-bold text-white">
                {has111 ? "✓" : "—"}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl"
            >
              <p className="text-white/80 text-sm mb-1">3-3-3</p>
              <p className="text-3xl font-bold text-white">
                {has333 ? "✓" : "—"}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Unlocked Achievements */}
        <div className="max-w-7xl mx-auto space-y-8">
          {unlockedAchievements.length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center gap-3 mb-6"
              >
                <h2 className="text-2xl font-bold text-white">
                  Unlocked ({unlockedAchievements.length})
                </h2>
                <div className="px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-green-100 text-sm font-medium border border-green-400/30">
                  {unlockedAchievements.length}
                </div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border-2 border-green-400/40 shadow-2xl hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                            className={`w-14 h-14 bg-gradient-to-br ${achievement.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-white">
                                {achievement.title}
                              </h3>
                              <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0 ml-2" />
                            </div>
                            <p className="text-sm text-white/80 mb-3">
                              {achievement.description}
                            </p>
                            {achievement.unlockedDate && (
                              <p className="text-xs text-white/60">
                                Unlocked on {achievement.unlockedDate}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex items-center gap-3 mb-6"
              >
                <h2 className="text-2xl font-bold text-white">
                  In Progress ({lockedAchievements.length})
                </h2>
                <div className="px-3 py-1 bg-gray-500/20 backdrop-blur-sm rounded-full text-gray-100 text-sm font-medium border border-gray-400/30">
                  {lockedAchievements.length}
                </div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  const hasProgress =
                    achievement.progress !== undefined &&
                    achievement.maxProgress !== undefined;
                  const progressPercentage = hasProgress
                    ? (achievement.progress! / achievement.maxProgress!) * 100
                    : 0;

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    >
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 opacity-80">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                            <Icon className="w-8 h-8 text-white/40" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
                              <Lock className="w-5 h-5 text-white/60" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white/90 mb-2">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-white/70 mb-3">
                              {achievement.description}
                            </p>
                            {hasProgress && (
                              <div>
                                <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                                  <span>Progress</span>
                                  <span>
                                    {achievement.progress}/
                                    {achievement.maxProgress}
                                  </span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${progressPercentage}%`,
                                    }}
                                    transition={{
                                      delay: 1 + index * 0.1,
                                      duration: 0.8,
                                      ease: "easeOut",
                                    }}
                                    className="h-full bg-gradient-to-r from-[#00a651] to-[#ffb81c] rounded-full"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No achievements yet */}
          {unlockedAchievements.length === 0 &&
            lockedAchievements.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-16 border border-white/20 shadow-2xl text-center"
              >
                <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No achievements yet
                </h3>
                <p className="text-white/80">
                  Start attending events to unlock achievements!
                </p>
              </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}
