import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * SECURITY: replaces an inline `@Body()` literal.
 *
 * An inline object type has metatype `Object`, which ValidationPipe skips
 * entirely - so `provider`, `code`, and `state` reached the OAuth exchange
 * completely unvalidated, guarded only by a truthiness check.
 */
export class LinkOAuthDto {
  @IsIn(['google', 'discord'])
  provider: 'google' | 'discord';

  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  state: string;
}
