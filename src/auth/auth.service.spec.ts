import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService, JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test_secret',
          signOptions: { expiresIn: '1h' }
        })
      ],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    
    // Reset mocks before each test
    vi.mocked(bcrypt.compare).mockClear();
    vi.mocked(bcrypt.hash).mockClear();
  });

  it('should login successfully with correct credentials', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authService.login('test@example.com', 'password123');

    expect(result).toHaveProperty('access_token');
    expect(jwtService.sign).toHaveBeenCalled();
  });

  it('should throw error for missing email or password', async () => {
    await expect(authService.login('', '')).rejects.toThrow('Email and password are required');
  });

  it('should throw error for invalid credentials', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(authService.login('test@example.com', 'wrongpassword'))
      .rejects.toThrow('Invalid credentials');
  });
});