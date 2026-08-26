import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMemberDuesDto {
  @IsOptional()
  @IsBoolean()
  chapterDuesSelfReported?: boolean;

  @IsOptional()
  @IsBoolean()
  nationalDuesSelfReported?: boolean;
}
