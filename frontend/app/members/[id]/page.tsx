'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Calendar, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getApiUrl, apiHeaders } from '@/lib/api';

interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
}

export default function MemberProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/members/${params.id}/profile`, {
          headers: apiHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
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
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">Member not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.photoUrl} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback className="text-2xl">
                {profile.firstName[0]}{profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl">
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <CardDescription className="text-lg">{profile.email}</CardDescription>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">{profile.role}</Badge>
                {profile.major && <Badge variant="outline">{profile.major}</Badge>}
                {profile.graduationYear && <Badge variant="outline">Class of {profile.graduationYear}</Badge>}
                <Badge variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  {profile.totalEventsAttended} Events Attended
                </Badge>
              </div>
            </div>
          </CardHeader>
          {profile.bio && (
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          )}
        </Card>

        {/* Contact Information */}
        {(profile.phoneNumber || profile.linkedInUrl || profile.discordUsername) && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.phoneNumber && (
                <div>
                  <span className="font-semibold">Phone: </span>
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              {profile.linkedInUrl && (
                <div>
                  <span className="font-semibold">LinkedIn: </span>
                  <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {profile.linkedInUrl}
                  </a>
                </div>
              )}
              {profile.discordUsername && (
                <div>
                  <span className="font-semibold">Discord: </span>
                  <span>{profile.discordUsername}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 1-1-1 Achievement */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {profile.achievements.oneOneOne.completed ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-gray-300" />
                )}
                <div>
                  <h3 className="font-semibold">1-1-1 Achievement</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.achievements.oneOneOne.completed
                      ? `Completed on ${new Date(profile.achievements.oneOneOne.completedAt!).toLocaleDateString()}`
                      : 'Not yet completed'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-mono">
                  {profile.achievements.oneOneOne.progress.bucket1}/1 -{' '}
                  {profile.achievements.oneOneOne.progress.bucket2}/1 -{' '}
                  {profile.achievements.oneOneOne.progress.bucket3}/1
                </p>
              </div>
            </div>

            {/* 3-3-3 Achievement */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {profile.achievements.threeThreeThree.completed ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-gray-300" />
                )}
                <div>
                  <h3 className="font-semibold">3-3-3 Achievement</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.achievements.threeThreeThree.completed
                      ? `Completed on ${new Date(profile.achievements.threeThreeThree.completedAt!).toLocaleDateString()}`
                      : 'Not yet completed'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-mono">
                  {profile.achievements.threeThreeThree.progress.bucket1}/3 -{' '}
                  {profile.achievements.threeThreeThree.progress.bucket2}/3 -{' '}
                  {profile.achievements.threeThreeThree.progress.bucket3}/3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Last 10 events attended</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.recentAttendance.length === 0 ? (
                <p className="text-muted-foreground">No events attended yet</p>
              ) : (
                profile.recentAttendance.map((attendance) => (
                  <div
                    key={attendance.eventId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div>
                      <h4 className="font-medium">{attendance.eventTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attendance.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>{attendance.category.replace('_', ' ')}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
