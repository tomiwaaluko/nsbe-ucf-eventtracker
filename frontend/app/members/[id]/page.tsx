'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bricolage_Grotesque, Sora } from 'next/font/google';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Calendar, CheckCircle2, Mail, Award, TrendingUp, User, Shield, Lock, CalendarPlus, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getApiUrl, apiHeaders } from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';
import { ProgressCard } from '@/components/ProgressCard';
import { ProgressRing } from '@/components/ProgressRing';

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

interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  // Optional: the API returns contact details only to the member themselves
  // and to admins. Everyone else gets the non-PII view.
  email?: string;
  photoUrl?: string;
  major?: string;
  graduationYear?: number;
  phoneNumber?: string;
  linkedInUrl?: string;
  bio?: string;
  discordUsername?: string;
  role: string;
  totalEventsAttended: number;
  achievements: {
    oneOneOne: {
      completed: boolean;
      completedAt?: string;
      progress: { bucket1: number; bucket2: number; bucket3: number };
    };
    threeThreeThree: {
      completed: boolean;
      completedAt?: string;
      progress: { bucket1: number; bucket2: number; bucket3: number };
    };
  };
  recentAttendance: Array<{
    eventId: string;
    eventTitle: string;
    eventDate: string;
    category: string;
    checkedInAt: string;
  }>;
  plannedEvents?: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    location?: string;
    category: string;
  }>;
}

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [canView, setCanView] = useState<boolean>(false);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/');
          return;
        }

        const currentUser = JSON.parse(userData);
        setCurrentUserRole(currentUser.role);

        const isOwnProfile = currentUser.id === params.id;
        // Match role check used by Sidebar/TopBar/DashboardLayout: admin, super_admin (lowercase from API)
        const role = (currentUser.role || '').toLowerCase();
        const isAdmin = role === 'admin' || role === 'super_admin';

        // Admins and Super Admins can view ANY profile - no restrictions
        // Regular members can only view their own profile or friends' profiles
        let hasAccess = false;

        if (isAdmin) {
          // Admins and Super Admins have full access to all profiles (e.g. from Member Management)
          hasAccess = true;
        } else if (isOwnProfile) {
          // Users can always view their own profile
          hasAccess = true;
          console.log('Own profile access granted');
        } else {
          // Regular members viewing another member - check friendship
          try {
            const friendsResponse = await fetch(`${getApiUrl()}/friends`, {
              headers: apiHeaders({ Authorization: `Bearer ${token}` }),
            });

            if (friendsResponse.ok) {
              const friendsData = await friendsResponse.json();
              const isFriend = friendsData.some((f: any) => f.friend.id === params.id);
              hasAccess = isFriend;
              console.log('Friend check:', isFriend ? 'Access granted' : 'Access denied');
            }
          } catch (error) {
            console.error('Failed to check friendship status:', error);
            hasAccess = false;
          }
        }

        setCanView(hasAccess);

        if (!hasAccess) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        // Fetch profile if access is granted
        const response = await fetch(`${getApiUrl()}/members/${params.id}/profile`, {
          headers: apiHeaders({ Authorization: `Bearer ${token}` }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch member profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`flex items-center justify-center h-screen ${sora.className}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <div className="relative bg-white border-4 border-black p-8 text-center text-black">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00a651] border-t-transparent mx-auto mb-4"></div>
              <p className={`text-lg font-bold ${bricolage.className}`}>Loading Profile...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (accessDenied) {
    return (
      <DashboardLayout>
        <div className={`flex items-center justify-center h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] ${sora.className}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-md"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black p-8 text-center text-black">
              <Lock className="h-16 w-16 mx-auto mb-4 text-[#ed1c24]" />
              <h2 className={`text-2xl font-bold mb-2 ${bricolage.className}`}>Access Denied</h2>
              <p className={`mb-6 ${sora.className}`}>
                You need to be friends with this member to view their profile. Send them a friend request from the Friends page!
              </p>
              <button
                onClick={() => router.push('/friends')}
                className={`relative group ${sora.className}`}
              >
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
                <div className="relative bg-[#00a651] hover:bg-[#008a44] text-white font-bold py-3 px-6 border-4 border-black">
                  Go to Friends
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className={`flex items-center justify-center h-screen ${sora.className}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black p-8 text-center text-black">
              <h2 className={`text-2xl font-bold mb-2 ${bricolage.className}`}>Member Not Found</h2>
              <p className={sora.className}>This member profile could not be found.</p>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate progress
  const workshopProgress = (profile.achievements.threeThreeThree.progress.bucket1 / 3) * 100;
  const gbmProgress = (profile.achievements.threeThreeThree.progress.bucket3 / 3) * 100;
  const communityProgress = (profile.achievements.threeThreeThree.progress.bucket2 / 3) * 100;
  const overallProgress = ((profile.achievements.threeThreeThree.progress.bucket1 + profile.achievements.threeThreeThree.progress.bucket2 + profile.achievements.threeThreeThree.progress.bucket3) / 9) * 100;

  const getInitials = () => {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className={`container mx-auto p-4 sm:p-6 space-y-6 ${bricolage.variable} ${sora.variable}`}>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3" />
          <div className="relative bg-white border-4 border-black overflow-hidden">
            {/* Gradient Banner */}
            <div className="bg-gradient-to-r from-[#00a651] to-[#008a44] p-6 sm:p-8 border-b-4 border-black">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                <div className="relative">
                  <Avatar className="relative w-20 h-20 sm:w-24 sm:h-24 border-4 border-black">
                    <AvatarImage src={profile.photoUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback className="bg-white text-[#00a651] text-2xl sm:text-3xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 text-white">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h2 className={`text-2xl sm:text-3xl font-bold text-white ${bricolage.className}`}>
                      {profile.firstName} {profile.lastName}
                    </h2>
<Badge className={`bg-black text-white border-2 border-white font-bold ${sora.className}`}>
                        {profile.role}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/90">
                    {profile.email && (
                      <div className={`flex items-center gap-2 ${sora.className}`}>
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                    )}
                    {profile.major && (
                      <div className={`flex items-center gap-2 ${sora.className}`}>
                        <Award className="w-4 h-4" />
                        <span className="text-sm">{profile.major}</span>
                      </div>
                    )}
                    {profile.graduationYear && (
                      <div className={`flex items-center gap-2 ${sora.className}`}>
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Class of {profile.graduationYear}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {profile.bio && (
                <div className={`mt-4 pt-4 border-t-2 border-white/20 ${sora.className}`}>
                  <p className="text-white/90 text-sm sm:text-base">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Contact Information (if available) */}
            {(profile.phoneNumber || profile.linkedInUrl || profile.discordUsername) && (
              <div className="p-6 sm:p-8 bg-gray-50">
                <h3 className={`text-lg font-bold mb-4 text-black ${bricolage.className}`}>Contact Information</h3>
                <div className={`space-y-2 text-black ${sora.className}`}>
                  {profile.phoneNumber && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-black">Phone:</span>
                      <span className="text-black">{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile.linkedInUrl && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-black">LinkedIn:</span>
                      <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-[#00a651] hover:underline font-semibold">
                        View Profile
                      </a>
                    </div>
                  )}
                  {profile.discordUsername && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-black">Discord:</span>
                      <span className="text-black">{profile.discordUsername}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title="Total Events"
            value={profile.totalEventsAttended}
            icon={<Calendar className="w-6 h-6" />}
            color="#00a651"
            subtitle="All time"
          />
          <StatsCard
            title="Workshops & Socials"
            value={profile.achievements.threeThreeThree.progress.bucket1}
            icon={<Award className="w-6 h-6" />}
            color="#ffb81c"
            subtitle={`${Math.round(workshopProgress)}% of 3-3-3`}
          />
          <StatsCard
            title="GBMs"
            value={profile.achievements.threeThreeThree.progress.bucket3}
            icon={<User className="w-6 h-6" />}
            color="#00a651"
            subtitle={`${Math.round(gbmProgress)}% of 3-3-3`}
          />
          <StatsCard
            title="Community Service"
            value={profile.achievements.threeThreeThree.progress.bucket2}
            icon={<TrendingUp className="w-6 h-6" />}
            color="#ed1c24"
            subtitle={`${Math.round(communityProgress)}% of 3-3-3`}
          />
        </div>

        {/* Progress Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid gap-4 sm:gap-6">
            <ProgressCard
              title="Workshops & Socials"
              current={profile.achievements.threeThreeThree.progress.bucket1}
              target={3}
              category="workshops"
              color="#ffb81c"
              icon={<Award className="w-5 h-5" />}
            />
            <ProgressCard
              title="GBMs"
              current={profile.achievements.threeThreeThree.progress.bucket3}
              target={3}
              category="gbm"
              color="#00a651"
              icon={<User className="w-5 h-5" />}
            />
            <ProgressCard
              title="Community Service"
              current={profile.achievements.threeThreeThree.progress.bucket2}
              target={3}
              category="community"
              color="#ed1c24"
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3" />
            <div className="relative bg-white border-4 border-black p-6 h-full flex flex-col items-center justify-center text-black">
              <h3 className={`text-lg font-bold mb-4 ${bricolage.className}`}>Overall Progress</h3>
              <ProgressRing
                progress={overallProgress}
                size={160}
                strokeWidth={12}
                color="#00a651"
              />
              <p className={`text-sm mt-4 text-center ${sora.className}`}>
                {Math.round(overallProgress)}% Complete
              </p>
            </div>
          </motion.div>
        </div>

        {/* Planned Events */}
        {profile.plannedEvents !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3" />
            <div className="relative bg-white border-4 border-black p-6 sm:p-8 text-black">
              <div className="mb-4">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${bricolage.className}`}>
                  <CalendarPlus className="h-6 w-6 text-[#00a651]" />
                  Planned Events
                </h3>
                <p className={`text-sm ${sora.className}`}>Upcoming events they plan to attend</p>
              </div>
              <div className="space-y-3">
                {profile.plannedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={sora.className}>No upcoming planned events</p>
                  </div>
                ) : (
                  profile.plannedEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="relative"
                    >
                      <button
                        type="button"
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="relative w-full text-left flex items-center justify-between p-4 border-2 border-black bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold ${bricolage.className}`}>{event.name}</h4>
                          <p className={`text-sm ${sora.className}`}>
                            {new Date(event.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                          {event.location && (
                            <p className={`text-sm flex items-center gap-1 mt-1 ${sora.className}`}>
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {event.location}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <Badge className={`bg-black text-white border-2 border-black font-bold ${sora.className}`}>
                            {event.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3" />
          <div className="relative bg-white border-4 border-black p-6 sm:p-8 text-black">
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${bricolage.className}`}>
              <Trophy className="h-6 w-6 text-[#ffb81c]" />
              Achievements
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* 1-1-1 Achievement */}
              <div className="relative">
                <div className={`relative border-4 border-black p-4 ${profile.achievements.oneOneOne.completed ? 'bg-[#00a651]/10' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {profile.achievements.oneOneOne.completed ? (
                      <CheckCircle2 className="h-8 w-8 text-[#00a651] flex-shrink-0" />
                    ) : (
                      <div className="h-8 w-8 border-4 border-gray-300 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`font-bold text-lg ${bricolage.className}`}>1-1-1 Achievement</h4>
                      <p className={`text-sm ${sora.className}`}>
                        {profile.achievements.oneOneOne.completed
                          ? `Completed ${new Date(profile.achievements.oneOneOne.completedAt!).toLocaleDateString()}`
                          : 'Not yet completed'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-center pt-3 border-t-2 border-black/20 ${sora.className}`}>
                    <p className="text-xs mb-1 font-semibold">Progress</p>
                    <p className="font-mono font-bold text-lg">
                      {profile.achievements.oneOneOne.progress.bucket1}/1 -{' '}
                      {profile.achievements.oneOneOne.progress.bucket2}/1 -{' '}
                      {profile.achievements.oneOneOne.progress.bucket3}/1
                    </p>
                  </div>
                </div>
              </div>

              {/* 3-3-3 Achievement */}
              <div className="relative">
                <div className={`relative border-4 border-black p-4 ${profile.achievements.threeThreeThree.completed ? 'bg-[#ffb81c]/20' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {profile.achievements.threeThreeThree.completed ? (
                      <CheckCircle2 className="h-8 w-8 text-[#ffb81c] flex-shrink-0" />
                    ) : (
                      <div className="h-8 w-8 border-4 border-gray-300 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`font-bold text-lg ${bricolage.className}`}>3-3-3 Achievement</h4>
                      <p className={`text-sm ${sora.className}`}>
                        {profile.achievements.threeThreeThree.completed
                          ? `Completed ${new Date(profile.achievements.threeThreeThree.completedAt!).toLocaleDateString()}`
                          : 'Not yet completed'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-center pt-3 border-t-2 border-black/20 ${sora.className}`}>
                    <p className="text-xs mb-1 font-semibold">Progress</p>
                    <p className="font-mono font-bold text-lg">
                      {profile.achievements.threeThreeThree.progress.bucket1}/3 -{' '}
                      {profile.achievements.threeThreeThree.progress.bucket2}/3 -{' '}
                      {profile.achievements.threeThreeThree.progress.bucket3}/3
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3" />
          <div className="relative bg-white border-4 border-black p-6 sm:p-8 text-black">
            <div className="mb-4">
              <h3 className={`text-xl font-bold ${bricolage.className}`}>Recent Attendance</h3>
              <p className={`text-sm ${sora.className}`}>Last 10 events attended</p>
            </div>
            <div className="space-y-3">
              {profile.recentAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <p className={sora.className}>No events attended yet</p>
                </div>
              ) : (
                profile.recentAttendance.map((attendance, index) => (
                  <motion.div
                    key={attendance.eventId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="relative"
                  >
                    <div className="relative flex items-center justify-between p-4 border-2 border-black bg-white">
                      <div className="flex-1">
                        <h4 className={`font-bold ${bricolage.className}`}>{attendance.eventTitle}</h4>
                        <p className={`text-sm ${sora.className}`}>
                          {new Date(attendance.eventDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Badge className={`bg-black text-white border-2 border-black font-bold ${sora.className}`}>
                          {attendance.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
