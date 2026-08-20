import { IsIn, IsOptional } from 'class-validator';

export class ExportMemberDataQueryDto {
  @IsOptional()
  @IsIn(['json', 'csv'])
  format?: 'json' | 'csv';
}

/** Allowed Member scalars for self-service export (explicit allowlist). */
export const MEMBER_EXPORT_PROFILE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
  passwordHash: true,
  isActive: true,
  bio: true,
  discordUsername: true,
  graduationYear: true,
  linkedInUrl: true,
  major: true,
  phoneNumber: true,
  photoUrl: true,
} as const;

/** Safe event fields for member-facing export (no qrSecret or checkInCode). */
export const MEMBER_EXPORT_EVENT_SELECT = {
  id: true,
  name: true,
  description: true,
  category: true,
  semester: true,
  startTime: true,
  endTime: true,
  location: true,
  isActive: true,
} as const;

export const MEMBER_EXPORT_ATTENDANCE_SELECT = {
  id: true,
  checkedInAt: true,
  checkInMethod: true,
  event: { select: MEMBER_EXPORT_EVENT_SELECT },
} as const;

export const MEMBER_EXPORT_EVENT_INTEREST_SELECT = {
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  event: { select: MEMBER_EXPORT_EVENT_SELECT },
} as const;

export const MEMBER_EXPORT_POINT_ENTRY_SELECT = {
  id: true,
  pointTypeKey: true,
  points: true,
  semester: true,
  label: true,
  note: true,
  createdAt: true,
  awardedBy: {
    select: { firstName: true, lastName: true },
  },
} as const;

export const MEMBER_EXPORT_OAUTH_SELECT = {
  id: true,
  provider: true,
  providerEmail: true,
  emailVerified: true,
  createdAt: true,
} as const;
