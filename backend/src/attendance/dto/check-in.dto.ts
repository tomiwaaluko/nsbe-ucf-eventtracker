import { IsString } from 'class-validator';

export class CheckInDto {
  @IsString()
  eventId: string;

  @IsString()
  token: string;
}
