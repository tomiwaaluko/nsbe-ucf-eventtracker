import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  [key: string]: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    // Require the Bearer scheme explicitly rather than blindly taking [1].
    const [scheme, token] = authHeader.split(' ');
    if (!token || scheme?.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;

      if (!jwtSecret) {
        console.error('SUPABASE_JWT_SECRET not configured');
        throw new UnauthorizedException('Server configuration error');
      }

      // Pin the algorithm. Without `algorithms`, verification accepts whatever
      // the token's own header asks for - the attacker controls that field, and
      // algorithm-confusion attacks live in exactly that gap.
      const payload = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
      }) as JwtPayload;

      // A token is only usable if it carries the claims we key identity on.
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Token missing required claims');
      }

      // Extract name from Supabase user_metadata if present
      const metadata = payload.user_metadata
        ? {
            firstName: payload.user_metadata.first_name || payload.user_metadata.firstName,
            lastName: payload.user_metadata.last_name || payload.user_metadata.lastName,
          }
        : undefined;

      // Whether the identity provider considers this address confirmed.
      //
      // These claims come from inside the signed token, so they are as
      // trustworthy as the signing secret - they are NOT client-supplied.
      // Supabase places the flag in user_metadata; some token versions also
      // surface it at the top level, so check both and default to false.
      const emailVerified =
        payload.email_verified === true ||
        payload.user_metadata?.email_verified === true;

      // Sync user with database - this ensures the Supabase user exists in Prisma
      await this.authService.findOrCreateMember(
        payload.sub,
        payload.email,
        metadata,
        emailVerified,
      );

      request.user = {
        ...payload,
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error: any) {
      // Preserve deliberate rejections (e.g. the identity-conflict refusal in
      // findOrCreateMember) instead of flattening them to "Invalid token",
      // which would send an operator hunting for a token problem that isn't
      // there. Anything else stays generic.
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('JWT verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
