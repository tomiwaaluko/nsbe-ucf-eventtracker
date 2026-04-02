import { IsArray, IsString } from 'class-validator';

export class ResolveMembersDto {
  @IsArray()
  @IsString({ each: true })
  lines: string[]; // raw lines pasted by admin — each is a name or email
}
