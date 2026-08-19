import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUrl,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  major?: string;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2035)
  graduationYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  linkedInUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  discordUsername?: string;

  @IsOptional()
  @IsBoolean()
  chapterDuesSelfReported?: boolean;

  @IsOptional()
  @IsBoolean()
  nationalDuesSelfReported?: boolean;
}
