import { Request } from 'express';
import { getClientIp } from './client-ip.util';

const buildRequest = (overrides: {
  ip?: string;
  'x-forwarded-for'?: unknown;
} = {}): Request =>
  ({
    ip: overrides.ip,
    headers:
      overrides['x-forwarded-for'] !== undefined
        ? { 'x-forwarded-for': overrides['x-forwarded-for'] }
        : {},
  }) as unknown as Request;

describe('getClientIp', () => {
  it('should prefer the resolved request.ip', () => {
    expect(getClientIp(buildRequest({ ip: '192.168.1.5' }))).toBe('192.168.1.5');
  });

  it('should take the first X-Forwarded-For entry when request.ip is missing', () => {
    expect(
      getClientIp(buildRequest({ 'x-forwarded-for': '10.0.0.1, 172.16.0.1' })),
    ).toBe('10.0.0.1');
  });

  it('should trim surrounding whitespace from the first entry', () => {
    expect(getClientIp(buildRequest({ 'x-forwarded-for': ' 8.8.8.8 ' }))).toBe(
      '8.8.8.8',
    );
  });

  it('should ignore a non-string X-Forwarded-For header', () => {
    expect(getClientIp(buildRequest({ 'x-forwarded-for': ['9.9.9.9'] }))).toBe(
      '0.0.0.0',
    );
  });

  it('should fall back to 0.0.0.0 when nothing is available', () => {
    expect(getClientIp(buildRequest())).toBe('0.0.0.0');
    expect(getClientIp(buildRequest({ 'x-forwarded-for': ' ' }))).toBe(
      '0.0.0.0',
    );
  });
});