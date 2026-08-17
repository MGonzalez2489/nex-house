/**
 * Get base URL from env or default values
 */
export const getAppBaseUrl = (): string => {
  return process.env.APP_URL || 'http://localhost:3000';
};

/**
 * Format relative path to a full URL
 */
export const buildPublicUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;

  // Si ya es una URL absoluta (S3, Cloudinary, OAuth), la devuelve intacta
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = getAppBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};
