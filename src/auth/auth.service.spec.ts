import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Use a manual mock 
const mockBcrypt = {
  hash: vi.fn(),
  compare: vi.fn()
};

vi.mock('bcrypt', () => mockBcrypt);

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { 
          provide: JwtService, 
          useValue: {
            sign: vi.fn().mockReturnValue('test_token')
          }
        }
      ],
    }).compile();

    authService = module.get(AuthService);
    jwtService = module.get(JwtService);

    // Reset mocks
    mockBcrypt.hash.mockReset();
    mockBcrypt.compare.mockReset();
  });

  it('should login successfully with correct credentials', async () => {
    mockBcrypt.hash.mockResolvedValue('hashed_password');
    mockBcrypt.compare.mockResolvedValue(true);

    const result = await authService.login('test@example.com', 'password123');

    expect(result).toEqual({ access_token: 'test_token' });
    expect(jwtService.sign).toHaveBeenCalledOnce();
  });

  it('should throw error for missing email or password', async () => {
    await expect(authService.login('', '')).rejects.toThrow('Email and password are required');
  });

  it('should throw error for invalid credentials', async () => {
    mockBcrypt.compare.mockResolvedValue(false);

    await expect(authService.login('test@example.com', 'wrongpassword'))
      .rejects.toThrow('Invalid credentials');
  });
});