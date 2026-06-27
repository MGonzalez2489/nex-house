import {
  isStringOnlyDigits,
  validatePhone,
  formatPhone,
  isValidEmail,
  generateRandomString,
} from './string.util';

describe('String Validation & Formatting Utilities', () => {
  describe('isStringOnlyDigits', () => {
    it('should return true for a string containing only numbers', () => {
      expect(isStringOnlyDigits('1234567890')).toBe(true);
    });

    it('should return false if the string contains letters or symbols', () => {
      expect(isStringOnlyDigits('123a45')).toBe(false);
      expect(isStringOnlyDigits('123-456')).toBe(false);
      expect(isStringOnlyDigits('123.45')).toBe(false);
    });

    it('should return false for an empty string', () => {
      expect(isStringOnlyDigits('')).toBe(false);
    });

    it('should return false if the string contains spaces', () => {
      expect(isStringOnlyDigits('123 456')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should return true for a standard 10-digit Mexican number', () => {
      expect(validatePhone('5512345678')).toBe(true);
    });

    it('should return true for international Mexican formats (+52 and +521)', () => {
      expect(validatePhone('+525512345678')).toBe(true);
      expect(validatePhone('+5215512345678')).toBe(true);
    });

    it('should return true for legacy prefixes (044 and 01) followed by 10 digits', () => {
      expect(validatePhone('0445512345678')).toBe(true);
      expect(validatePhone('015512345678')).toBe(true);
    });

    it('should return false for phone numbers with invalid length', () => {
      expect(validatePhone('123456789')).toBe(false); // 9 digits
      expect(validatePhone('12345678901')).toBe(false); // 11 digits
    });

    it('should return false if it contains spaces or formatting characters', () => {
      expect(validatePhone('+52 (55) 1234-5678')).toBe(false);
    });
  });

  describe('formatPhone', () => {
    it('should strip all formatting and leave only numeric digits', () => {
      expect(formatPhone('+52 (55) 1234-5678')).toBe('525512345678');
    });

    it('should return an empty string if there are no numbers at all', () => {
      expect(formatPhone('abc-def!!')).toBe('');
    });

    it('should leave an already clean digit string untouched', () => {
      expect(formatPhone('5512345678')).toBe('5512345678');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for standard valid emails', () => {
      expect(isValidEmail('manuel@nexhouse.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for emails missing the TLD', () => {
      expect(isValidEmail('user@domain')).toBe(false);
    });

    it('should return false for emails missing the @ symbol or username', () => {
      expect(isValidEmail('domain.com')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isValidEmail('DEV@DOMAIN.MEXICO')).toBe(true);
    });
  });

  describe('generateRandomString', () => {
    it('should generate a string of the exact requested length', () => {
      expect(generateRandomString(10)).toHaveLength(10);
      expect(generateRandomString(0)).toHaveLength(0);
      expect(generateRandomString(128)).toHaveLength(128);
    });

    it('should only contain alphanumeric characters', () => {
      const result = generateRandomString(50);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate distinct values on consecutive executions', () => {
      const stringA = generateRandomString(20);
      const stringB = generateRandomString(20);
      expect(stringA).not.toBe(stringB);
    });
  });
});
