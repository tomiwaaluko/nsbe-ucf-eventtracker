import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

/**
 * Build the CORS origin allowlist.
 *
 * SECURITY: this used to be `[/\.vercel\.app$/, /\.railway\.app$/]` with
 * `credentials: true`. Those patterns match EVERY deployment on those
 * platforms, not just ours - anyone can deploy a page to a free `*.vercel.app`
 * subdomain and it would have been an allowed origin for this API.
 *
 * Origins now come from CORS_ORIGINS (comma-separated). The localhost defaults
 * are kept for development only.
 */
function buildCorsOrigins(): (string | RegExp)[] {
  const configured = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    // Fail loudly rather than silently falling back to a permissive default.
    throw new Error(
      'CORS_ORIGINS must be set in production (comma-separated list of allowed frontend origins)',
    );
  }

  return ['http://localhost:3000', 'http://localhost:5173'];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Baseline security headers. The API served none: no HSTS, no nosniff, no
  // frame protection, no referrer policy.
  app.use(
    helmet({
      // This is a JSON API, not an HTML surface. A restrictive CSP here costs
      // nothing and blocks anything that tries to render a response as a page.
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // Reject unknown properties instead of silently stripping them. Silent
      // stripping hides client/server contract drift and makes an accidental
      // mass-assignment much harder to notice.
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: buildCorsOrigins(),
    credentials: true,
  });

  // Enable shutdown hooks for graceful database disconnect
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();
