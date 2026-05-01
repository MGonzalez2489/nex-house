/**
 * Checks if a string consists exclusively of numeric digits.
 *
 * @example
 * isStringOnlyDigits("12345"); // true
 * isStringOnlyDigits("123a45"); // false (invalid)
 */
export function isStringOnlyDigits(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Validates a phone number based on common Mexican formats.
 * Supports: +52 1, +52, 044, 01, and 10-digit local formats.
 *
 * @example
 * validatePhone("5512345678"); // true (10 digits)
 * validatePhone("+5215512345678"); // true (International)
 * validatePhone("abc1234567"); // false (invalid characters)
 */
export function validatePhone(phone: string): boolean {
  const regex =
    /^(\+521[0-9]{10}|\+52[0-9]{10}|044[0-9]{10}|01[0-9]{10}|[0-9]{10})$/;

  return regex.test(phone);
}

/**
 * Removes all non-numeric characters from a string.
 *
 * @example
 * formatPhone("+52 (55) 1234-5678"); // "525512345678"
 * formatPhone("phone-123"); // "123"
 */
export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validates if an email string follows a standard format.
 *
 * @example
 * isValidEmail("dev@example.com"); // true
 * isValidEmail("user.name@domain"); // false (missing TLD)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

export function generateRandomString(length: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
