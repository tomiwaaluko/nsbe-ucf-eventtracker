import { motion } from "framer-motion";
import { Mail, Calendar, Award, TrendingUp, User, Shield } from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { StatsCard } from "./StatsCard";
import { ProgressCard } from "./ProgressCard";
import { AttendanceTable } from "./AttendanceTable";
import { AchievementBadge } from "./AchievementBadge";
import { ProgressRing } from "./ProgressRing";

interface MemberProfileProps {
  member: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    totalEvents: number;
    workshopsAttended: number;
    gbmAttended: number;
    communityServiceAttended: number;
    createdAt: Date;
    attendanceHistory: Array<{
      id: string;
      eventName: string;
      eventCategory: "COMMUNITY_SERVICE" | "GBM" | "SOCIAL_AEX";
      checkedInAt: Date;
      checkInMethod: "qr" | "manual" | "exception";
    }>;
  };
}

export function MemberProfile({ member }: MemberProfileProps) {
  const getInitials = () => {
    if (member.firstName && member.lastName) {
      return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
    }
    return member.email[0].toUpperCase();
  };

  const getFullName = () => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    return member.email;
  };

  const getMemberSince = () => {
    return new Date(member.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Calculate progress
  const workshopProgress = (member.workshopsAttended / 3) * 100;
  const gbmProgress = (member.gbmAttended / 3) * 100;
  const communityProgress = (member.communityServiceAttended / 3) * 100;
  const overallProgress =
    ((member.workshopsAttended +
      member.gbmAttended +
      member.communityServiceAttended) /
      9) *
    100;

  // Check achievements
  const has111 =
    member.workshopsAttended >= 1 &&
    member.gbmAttended >= 1 &&
    member.communityServiceAttended >= 1;
  const has333 =
    member.workshopsAttended >= 3 &&
    member.gbmAttended >= 3 &&
    member.communityServiceAttended >= 3;

  const roleConfig: Record<string, { label: string; color: string }> = {
    member: { label: "Member", color: "bg-blue-100 text-blue-700" },
    admin: { label: "Admin", color: "bg-purple-100 text-purple-700" },
    super_admin: { label: "Super Admin", color: "bg-red-100 text-red-700" },
  };

  const roleInfo = roleConfig[member.role] || roleConfig.member;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#00a651] to-[#008a44] rounded-2xl p-8 text-white"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarFallback className="bg-white text-[#00a651] text-2xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-white">{getFullName()}</h2>
              <Badge className={`${roleInfo.color} border-0`}>
                {roleInfo.label}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-green-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member since {getMemberSince()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events"
          value={member.totalEvents}
          icon={<Calendar className="w-6 h-6" />}
          color="#00a651"
          subtitle="All time"
        />
        <StatsCard
          title="Workshops"
          value={member.workshopsAttended}
          icon={<Award className="w-6 h-6" />}
          color="#ffb81c"
          subtitle={`${Math.round(workshopProgress)}% of 3-3-3`}
        />
        <StatsCard
          title="GBMs"
          value={member.gbmAttended}
          icon={<User className="w-6 h-6" />}
          color="#00a651"
          subtitle={`${Math.round(gbmProgress)}% of 3-3-3`}
        />
        <StatsCard
          title="Community Service"
          value={member.communityServiceAttended}
          icon={<TrendingUp className="w-6 h-6" />}
          color="#ed1c24"
          subtitle={`${Math.round(communityProgress)}% of 3-3-3`}
        />
      </div>

      {/* Progress section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-gray-900 mb-6">3-3-3 Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProgressCard
              title="Workshops"
              current={member.workshopsAttended}
              target={3}
              category="workshops"
              color="#ffb81c"
              icon={<Award className="w-6 h-6" />}
            />
            <ProgressCard
              title="GBMs"
              current={member.gbmAttended}
              target={3}
              category="gbm"
              color="#00a651"
              icon={<User className="w-6 h-6" />}
            />
            <ProgressCard
              title="Community"
              current={member.communityServiceAttended}
              target={3}
              category="community"
              color="#ed1c24"
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center">
          <h4 className="text-gray-900 mb-4">Overall Progress</h4>
          <ProgressRing progress={overallProgress} size={160} color="#00a651" />
          <p className="text-sm text-gray-500 mt-4 text-center">
            {Math.round(overallProgress)}% towards 3-3-3 goal
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-gray-900 mb-6">Achievements</h3>
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
            unlocked={member.totalEvents > 0}
            icon={<Calendar className="w-8 h-8" />}
            color="#ed1c24"
          />
          <AchievementBadge
            title="Super Active"
            description="Attended 10+ events"
            unlocked={member.totalEvents >= 10}
            icon={<TrendingUp className="w-8 h-8" />}
            color="#00a651"
          />
        </div>
      </div>

      {/* Attendance history */}
      <div>
        <h3 className="text-gray-900 mb-4">Attendance History</h3>
        <AttendanceTable records={member.attendanceHistory} />
      </div>
    </div>
  );
}
