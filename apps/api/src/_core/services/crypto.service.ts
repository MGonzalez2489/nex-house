import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly SALT_ROUNDS = 10;

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
}
