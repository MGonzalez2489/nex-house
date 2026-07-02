export const isProd = process.env.NODE_ENV === 'production';
export const isDev =
  process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
export const isTest = process.env.NODE_ENV === 'test';
