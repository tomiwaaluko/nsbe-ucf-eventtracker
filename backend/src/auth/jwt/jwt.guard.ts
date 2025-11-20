import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

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
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Sync user with database - this ensures the Supabase user exists in Prisma
      await this.authService.findOrCreateMember(
        payload.sub as string,
        payload.email as string,
      );

      request.user = {
        id: payload.sub,
        email: payload.email,
        ...payload,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
