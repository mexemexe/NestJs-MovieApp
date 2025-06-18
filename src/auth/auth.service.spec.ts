import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Dynamically imported bcrypt
let bcryptModule: typeof import('bcrypt');

vi.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    // Dynamically import bcrypt after mocking
    bcryptModule = await import('bcrypt');

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { 
          provide: JwtService, 
          useValue: {
            sign: vi.fn((payload) => {
              // Mock sign implementation
              return 'test_token_' + payload.email;
            })
          }
        }
      ],
    }).compile();

    authService = module.get(AuthService);
    jwtService = module.get(JwtService);

    // Reset mocks
    vi.mocked(bcryptModule.compare).mockReset();
    vi.mocked(bcryptModule.hash).mockReset();

    // Default mock implementations
    vi.mocked(bcryptModule.hash).mockResolvedValue('hashed_password');
    vi.mocked(bcryptModule.compare).mockResolvedValue(true);
  });

  it('should login successfully with correct credentials', async () => {
    const result = await authService.login('test@example.com', 'password123');

    expect(result).toEqual({ access_token: 'test_token_test@example.com' });
    expect(jwtService.sign).toHaveBeenCalledOnce();
  });

  it('should throw error for missing email or password', async () => {
    await expect(authService.login('', '')).rejects.toThrow('Email and password are required');
  });

  it('should throw error for invalid credentials', async () => {
    vi.mocked(bcryptModule.compare).mockResolvedValue(false);

    await expect(authService.login('test@example.com', 'wrongpassword'))
      .rejects.toThrow('Invalid credentials');
  });

  it('should call jwtService.sign in signToken method', () => {
    const payload = { sub: '1', email: 'test@example.com' };
    const token = authService.signToken(payload);

    expect(token).toBe('test_token_test@example.com');
    expect(jwtService.sign).toHaveBeenCalledWith(payload);
  });
});