import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock bcrypt module
vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let bcrypt: { compare: any, hash: any };

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
    bcrypt = await import('bcrypt');

    // Reset mocks
    bcrypt.compare.mockReset();
    bcrypt.hash.mockReset();
  });

  it('should login successfully with correct credentials', async () => {
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('hashed_password');

    const result = await authService.login('test@example.com', 'password123');

    expect(result).toEqual({ access_token: 'test_token' });
    expect(jwtService.sign).toHaveBeenCalledOnce();
  });

  it('should throw error for missing email or password', async () => {
    await expect(authService.login('', '')).rejects.toThrow('Email and password are required');
  });

  it('should throw error for invalid credentials', async () => {
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login('test@example.com', 'wrongpassword'))
      .rejects.toThrow('Invalid credentials');
  });
});