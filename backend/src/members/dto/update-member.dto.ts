import { IsString, IsOptional } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
