import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limit tracker that works behind Railway's edge proxy.
 *
 * The stock ThrottlerGuard keys buckets on `req.ip`, and neither of the
 * out-of-the-box options is correct here:
 *
 *   - WITHOUT `trust proxy`, `req.ip` is the socket address - which behind a
 *     proxy is the SAME private address for every inbound request. Every user
 *     then shares one bucket, and ordinary traffic during a GBM trips the
 *     limit for the whole chapter. An app-wide self-DoS.
 *
 *   - WITH `trust proxy: true`, `req.ip` becomes the LEFTMOST X-Forwarded-For
 *     entry, which is entirely caller-supplied. Rotating that header per
 *     request yields an unlimited budget, so the limiter does nothing.
 *
 * Correct answer: the RIGHTMOST X-Forwarded-For entry. A proxy appends the
 * address it observed, so the last hop is the only entry our own edge wrote;
 * everything to its left may have been supplied by the caller.
 *
 * Note this cannot key on `req.user.id`: NestJS runs global guards before
 * controller-scoped ones, so JwtAuthGuard has not populated `req.user` yet.
 *
 * Callers sharing a NAT share a bucket. That is why the global limit is
 * generous and only sensitive routes tighten it with @Throttle.
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const forwarded = req.headers?.['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.length > 0) {
      const hops = forwarded.split(',');
      return hops[hops.length - 1].trim();
    }

    // Express collapses repeated headers into an array.
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return String(forwarded[forwarded.length - 1]).trim();
    }

    return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  }
}
