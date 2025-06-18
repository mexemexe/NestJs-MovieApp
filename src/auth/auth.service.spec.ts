import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: { sign: ReturnType<typeof vi.fn> };
  let bcryptMock: { 
    compare: ReturnType<typeof vi.fn>, 
    hash: ReturnType<typeof vi.fn> 
  };

  beforeEach(async () => {
    // Create mock implementations
    bcryptMock = {
      compare: vi.fn(),
      hash: vi.fn()
    };

    // Replace global bcrypt with mock
    vi.spyOn(bcrypt, 'compare').mockImplementation(bcryptMock.compare);
    vi.spyOn(bcrypt, 'hash').mockImplementation(bcryptMock.hash);

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

    // Default mock implementations
    bcryptMock.hash.mockResolvedValue('hashed_password');
    bcryptMock.compare.mockResolvedValue(true);
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
    bcryptMock.compare.mockResolvedValue(false);

    await expect(authService.login('test@example.com', 'wrongpassword'))
      .rejects.toThrow('Invalid credentials');
  });

  it('should call jwtService.sign in signToken method', () => {
    const payload = { sub: '1', email: 'test@example.com' };
    const token = authService.signToken(payload);

    expect(token).toBe('test_token_test@example.com');
    expect(jwtService.sign).toHaveBeenCalledWith(payload);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});