import { IsIn } from 'class-validator';

/**
 * Roles that may be assigned through the API.
 *
 * SECURITY: this endpoint previously took an inline `@Body()` literal, which
 * carries no validation metadata - so ValidationPipe silently skipped it and
 * the raw string went straight into `prisma.member.update({ data: { role } })`.
 * Any value was writable. Because isAdmin()/isSuperAdmin() compare exactly, a
 * typo like "Admin" would strip a user's access with no error anywhere.
 */
export const ASSIGNABLE_ROLES = ['member', 'admin', 'super_admin'] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export class UpdateRoleDto {
  @IsIn(ASSIGNABLE_ROLES, {
    message: `role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`,
  })
  role: AssignableRole;
}
