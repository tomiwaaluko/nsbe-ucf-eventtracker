import { IsIn, IsOptional } from 'class-validator';

export class ExportMemberDataQueryDto {
  @IsOptional()
  @IsIn(['json', 'csv'])
  format?: 'json' | 'csv';
}

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
