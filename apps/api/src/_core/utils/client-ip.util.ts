import { Request } from 'express';

const FALLBACK_IP = '0.0.0.0';

/**
 * Resolves the effective client IP in a consistent way for public endpoints.
 *
 * Priority:
 * 1. `request.ip` (Express resolved address, honors the `trust proxy` setting).
 * 2. The first value of the `X-Forwarded-For` header when it is a string —
 *    proxies append the client IP first, so taking the leading entry avoids
 *    persisting a whole proxy chain as the session IP.
 * 3. `0.0.0.0` when neither is available.
 *
 * @param request The incoming Express request.
 * @returns The resolved client IP address.
 */
export const getClientIp = (request: Request): string => {
  if (request.ip) {
    return request.ip;
  }

  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  return FALLBACK_IP;
};