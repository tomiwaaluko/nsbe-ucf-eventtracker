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

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;

      if (!jwtSecret) {
        console.error('SUPABASE_JWT_SECRET not configured');
        throw new UnauthorizedException('Server configuration error');
      }

      const payload = jwt.verify(token, jwtSecret) as JwtPayload;

      // Extract name from Supabase user_metadata if present
      const metadata = payload.user_metadata
        ? {
            firstName: payload.user_metadata.first_name || payload.user_metadata.firstName,
            lastName: payload.user_metadata.last_name || payload.user_metadata.lastName,
          }
        : undefined;

      // Sync user with database - this ensures the Supabase user exists in Prisma
      await this.authService.findOrCreateMember(payload.sub, payload.email, metadata);

      request.user = {
        ...payload,
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error: any) {
      console.error('JWT verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
