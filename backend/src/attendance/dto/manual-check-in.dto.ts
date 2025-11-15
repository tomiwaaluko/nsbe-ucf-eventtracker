import { IsString } from 'class-validator';

export class ManualCheckInDto {
  @IsString()
  eventId: string;

  @IsString()
  memberId: string;
}
