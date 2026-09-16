import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import * as bcrypt from 'bcrypt';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should successfully generate a secure bcrypt hash string', async () => {
      const plainText = 'mySecurePassword123';

      const generatedHash = await service.hash(plainText);

      expect(generatedHash).toBeDefined();
      expect(typeof generatedHash).toBe('string');
      // Bcrypt hashes typically start with $2b$ or $2a$ and have a specific length
      expect(generatedHash.startsWith('$2b$')).toBe(true);
    });

    it('should produce a hash that matches the original plain text', async () => {
      const plainText = 'mySecurePassword123';

      const generatedHash = await service.hash(plainText);

      await expect(bcrypt.compare(plainText, generatedHash)).resolves.toBe(
        true,
      );
    });

    it('should generate a different hash for the same plain text on every call (random salt)', async () => {
      const plainText = 'samePassword';

      const firstHash = await service.hash(plainText);
      const secondHash = await service.hash(plainText);

      expect(firstHash).not.toEqual(secondHash);
      await expect(bcrypt.compare(plainText, firstHash)).resolves.toBe(true);
      await expect(bcrypt.compare(plainText, secondHash)).resolves.toBe(true);
    });

    it('should hash strings containing special and unicode characters', async () => {
      const plainText = 'P@sswörèd-123!😀';

      const generatedHash = await service.hash(plainText);

      await expect(bcrypt.compare(plainText, generatedHash)).resolves.toBe(
        true,
      );
    });

    it('should hash an empty string without error', async () => {
      const generatedHash = await service.hash('');

      expect(typeof generatedHash).toBe('string');
      await expect(bcrypt.compare('', generatedHash)).resolves.toBe(true);
    });

    it('should hash a long string without error', async () => {
      const plainText = 'A'.repeat(1000);

      const generatedHash = await service.hash(plainText);

      expect(typeof generatedHash).toBe('string');
      await expect(bcrypt.compare(plainText, generatedHash)).resolves.toBe(
        true,
      );
    });

    it('should reject when plain text is undefined or null', async () => {
      await expect(service.hash(undefined as unknown as string)).rejects.toThrow();
      await expect(service.hash(null as unknown as string)).rejects.toThrow();
    });
  });

  describe('compare', () => {
    it('should return true when the plain text matches the hash', async () => {
      const plainText = 'superSecretText';
      const saltRounds = 10;
      const realHash = await bcrypt.hash(plainText, saltRounds);

      const isMatch = await service.compare(plainText, realHash);

      expect(isMatch).toBe(true);
    });

    it('should return false when the plain text does not match the hash', async () => {
      const plainText = 'correctPassword';
      const wrongText = 'wrongPassword';
      const saltRounds = 10;
      const realHash = await bcrypt.hash(plainText, saltRounds);

      const isMatch = await service.compare(wrongText, realHash);

      expect(isMatch).toBe(false);
    });

    it('should return false when using an empty string', async () => {
      const plainText = 'superSecretText';
      const saltRounds = 10;
      const realHash = await bcrypt.hash(plainText, saltRounds);

      const isMatch = await service.compare('', realHash);

      expect(isMatch).toBe(false);
    });

    it('should return false when comparing against a hash of an empty string', async () => {
      const emptyHash = await bcrypt.hash('', 10);

      const isMatch = await service.compare('superSecretText', emptyHash);

      expect(isMatch).toBe(false);
    });

    it('should return false when the hash is not a valid bcrypt hash', async () => {
      const isMatch = await service.compare(
        'superSecretText',
        'not-a-bcrypt-hash',
      );

      expect(isMatch).toBe(false);
    });

    it('should reject when the hash argument is undefined or null', async () => {
      await expect(
        service.compare('superSecretText', undefined as unknown as string),
      ).rejects.toThrow();
      await expect(
        service.compare('superSecretText', null as unknown as string),
      ).rejects.toThrow();
    });
  });

  describe('generateRandomToken', () => {
    it('should generate a 64-character lowercase hexadecimal string', () => {
      const token = service.generateRandomToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toHaveLength(64);
      // Validates that the token contains only valid hexadecimal characters
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique values on consecutive calls', () => {
      const tokenA = service.generateRandomToken();
      const tokenB = service.generateRandomToken();

      expect(tokenA).not.toEqual(tokenB);
    });

    it('should not produce identical tokens in a batch', () => {
      const tokens = new Set(
        Array.from({ length: 100 }, () => service.generateRandomToken()),
      );

      expect(tokens.size).toBe(100);
    });

    it('should reach 256 bits of entropy in the generated token', () => {
      const token = service.generateRandomToken();
      const bytes = Buffer.from(token, 'hex');

      expect(bytes).toHaveLength(32);
    });
  });

  describe('isPasswordStrong', () => {
    it('should return true for a password meeting every requirement', () => {
      expect(service.isPasswordStrong('Strong1!x')).toBe(true);
    });

    it('should return true for a password at the minimum length of 8 characters', () => {
      expect(service.isPasswordStrong('Ab1!efgh')).toBe(true);
    });

    it('should return true for a long password meeting every requirement', () => {
      expect(service.isPasswordStrong('myVeryLongP@ssw0rd!123456')).toBe(true);
    });

    it('should return true for a password using every allowed special character', () => {
      expect(service.isPasswordStrong('A1!@$%*?&word')).toBe(true);
    });

    it('should return false for a password without an uppercase letter', () => {
      expect(service.isPasswordStrong('lowercase1!')).toBe(false);
    });

    it('should return false for a password without a lowercase letter', () => {
      expect(service.isPasswordStrong('UPPERCASE1!')).toBe(false);
    });

    it('should return false for a password without a digit', () => {
      expect(service.isPasswordStrong('NoDigitHere!')).toBe(false);
    });

    it('should return false for a password without a special character', () => {
      expect(service.isPasswordStrong('NoSpecial123')).toBe(false);
    });

    it('should return false for a password with a special character outside the allowed set', () => {
      expect(service.isPasswordStrong('Strong1,password')).toBe(false);
      expect(service.isPasswordStrong('Strong1#password')).toBe(false);
      expect(service.isPasswordStrong('Strong1_password')).toBe(false);
    });

    it('should return false for a password shorter than 8 characters', () => {
      expect(service.isPasswordStrong('Aa1!abc')).toBe(false);
    });

    it('should return false for an empty string', () => {
      expect(service.isPasswordStrong('')).toBe(false);
    });

    it('should return false for a password containing whitespace', () => {
      expect(service.isPasswordStrong('Strong1! pass')).toBe(false);
    });

    it('should return false for a password with only special characters', () => {
      expect(service.isPasswordStrong('$%*?&@!')).toBe(false);
    });
  });
});