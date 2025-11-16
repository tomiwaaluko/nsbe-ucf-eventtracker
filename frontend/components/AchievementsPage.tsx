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
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00843D] to-[#006830] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Achievements</h1>
                <p className="text-white/90 mt-1">
                  Track your progress and unlock rewards
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">Total Events</p>
                <p className="text-3xl font-bold text-white">
                  {memberData.totalEvents}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">Unlocked</p>
                <p className="text-3xl font-bold text-white">
                  {unlockedAchievements.length}/{achievements.length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">1-1-1</p>
                <p className="text-3xl font-bold text-white">
                  {has111 ? "✓" : "—"}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">3-3-3</p>
                <p className="text-3xl font-bold text-white">
                  {has333 ? "✓" : "—"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Unlocked ({unlockedAchievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedAchievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${achievement.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {achievement.title}
                            </h3>
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {achievement.description}
                          </p>
                          {achievement.unlockedDate && (
                            <p className="text-xs text-gray-500">
                              Unlocked on {achievement.unlockedDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              In Progress ({lockedAchievements.length})
            </h2>
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
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 border border-gray-200 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                          <Icon className="w-8 h-8 text-gray-400" />
                          <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-700 mb-2">
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {achievement.description}
                          </p>
                          {hasProgress && (
                            <div>
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>
                                  {achievement.progress}/
                                  {achievement.maxProgress}
                                </span>
                              </div>
                              <Progress
                                value={progressPercentage}
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* No achievements yet */}
        {unlockedAchievements.length === 0 &&
          lockedAchievements.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No achievements yet
              </h3>
              <p className="text-gray-600">
                Start attending events to unlock achievements!
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
