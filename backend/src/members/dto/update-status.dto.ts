import { IsBoolean } from 'class-validator';

/**
 * SECURITY: replaces an inline `@Body()` literal, which ValidationPipe cannot
 * validate. `isActive` reached the database unchecked, so a string or object
 * could be written into a boolean column.
 */
export class UpdateStatusDto {
  @IsBoolean()
  isActive: boolean;
}
