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
  });

  describe('generateRandomToken', () => {
    it('should generate a 64-character hexadecimal string', () => {
      const token = service.generateRandomToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toHaveLength(64);
      // Validates that the token contains only valid hexadecimal characters
      expect(token).toMatch(/^[0-9a-fA-F]+$/);
    });

    it('should generate unique values on consecutive calls', () => {
      const tokenA = service.generateRandomToken();
      const tokenB = service.generateRandomToken();

      expect(tokenA).not.toEqual(tokenB);
    });
  });
});
// import { Test, TestingModule } from '@nestjs/testing';
// import { CryptoService } from './crypto.service';
//
// describe('CryptoService', () => {
//   let service: CryptoService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [CryptoService],
//     }).compile();
//
//     service = module.get<CryptoService>(CryptoService);
//   });
//
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
