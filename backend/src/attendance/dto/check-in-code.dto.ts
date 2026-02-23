import { IsString, Length, Matches } from 'class-validator';

export class CheckInWithCodeDto {
  @IsString()
  @Length(6, 6, { message: 'Check-in code must be exactly 6 characters' })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Check-in code must contain only uppercase letters and numbers',
  })
  code: string;
}
