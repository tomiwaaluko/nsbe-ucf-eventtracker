import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { POINT_TYPES, PointTypeKey } from '../point-types.constant';

export class BulkAwardPointsDto {
  @IsArray()
  @IsString({ each: true })
  memberIds: string[];

  @IsString()
  @IsIn(Object.keys(POINT_TYPES))
  pointTypeKey: PointTypeKey;

  @IsString()
  semester: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
