import { IsBoolean } from 'class-validator';

export class UpdateMembershipDto {
  @IsBoolean()
  chapterMembershipActive: boolean;
}
