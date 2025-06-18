import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn()
}));

type MockBcrypt = {
  compare: ReturnType<typeof vi.fn>;
  hash: ReturnType<typeof vi.fn>;
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockJwtService: { sign: ReturnType<typeof vi.fn> };
  let mockBcrypt: MockBcrypt;

  beforeEach(async () => {
    // Import bcrypt dynamically after mocking
    mockBcrypt = (await import('bcrypt')) as MockBcrypt;

    mockJwtService = {
      sign: vi.fn().mockReturnValue('test_token')
    };

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

    // Setup default mocks
    mockBcrypt.hash.mockResolvedValue('hashed_password');
    mockBcrypt.compare.mockResolvedValue(true);
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

  afterEach(() => {
    vi.restoreAllMocks();
  });
});