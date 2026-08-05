import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly SALT_ROUNDS = 10;
  private readonly PASSWORD_STRENGTH_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  /**
   * Generates a secure hash for a given plain text string.
   * @param plainText The text to be hashed.
   * @returns A promise that resolves to the hashed string.
   */
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.SALT_ROUNDS);
  }

  /**
   * Compares a plain text string with a hash to verify if they match.
   * @param plainText The text to check.
   * @param hash The hash to compare against.
   * @returns A promise that resolves to true if they match, false otherwise.
   */
  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  /**
   * Generates a cryptographically secure random token for session management.
   * @returns A 64-character hexadecimal string.
   */
  generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Validates the strength of a given password using a predefined regex.
   * The regex requires:
   * - At least 8 characters long
   * - At least one uppercase letter (A-Z)
   * - At least one lowercase letter (a-z)
   * - At least one digit (0-9)
   * - At least one special character from the set [@$!%*?&]
   * @param password The password string to validate.
   * @returns True if the password meets the strength requirements, false otherwise.
   */
  isPasswordStrong(password: string): boolean {
    return this.PASSWORD_STRENGTH_REGEX.test(password);
  }
}
