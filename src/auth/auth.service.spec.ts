import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockJwtService = {
  sign: vi.fn().mockReturnValue('test_token')
};

const mockBcrypt = {
  compare: vi.fn(),
  hash: vi.fn()
};

vi.mock('bcrypt', () => mockBcrypt);

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { 
          provide: JwtService, 
          useValue: mockJwtService 
        }
      ],
    }).compile();

    authService = module.get(AuthService);

    mockBcrypt.compare.mockResolvedValue(true);
    mockBcrypt.hash.mockResolvedValue('hashed_password');
  });

  it('should login successfully with correct credentials', async () => {
    const result = await authService.login('test@example.com', 'password123');

    expect(result).toEqual({ access_token: 'test_token' });
    expect(mockJwtService.sign).toHaveBeenCalledOnce();
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