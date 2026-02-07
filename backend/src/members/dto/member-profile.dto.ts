export class MemberProfileDto {
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
  isActive: boolean;
  createdAt: Date;

  // Attendance statistics
  totalEventsAttended: number;

  // Achievement progress
  achievements: {
    oneOneOne: {
      completed: boolean;
      completedAt?: Date;
      progress: {
        bucket1: number; // Workshops & Socials
        bucket2: number; // Fundraiser & Community Service
        bucket3: number; // GBMs
      };
    };
    threeThreeThree: {
      completed: boolean;
      completedAt?: Date;
      progress: {
        bucket1: number;
        bucket2: number;
        bucket3: number;
      };
    };
  };

  // Recent attendance
  recentAttendance: Array<{
    eventId: string;
    eventTitle: string;
    eventDate: Date;
    category: string;
    checkedInAt: Date;
  }>;
}
