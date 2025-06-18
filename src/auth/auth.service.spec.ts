import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { vi, describe, it, expect, beforeEach } from 'vitest';

class MockJwtService {
  sign = vi.fn().mockReturnValue('mock_token');
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockJwtService: MockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { 
          provide: JwtService, 
          useClass: MockJwtService 
        }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mockJwtService = module.get(JwtService);

    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);
  });

  it('should login successfully with correct credentials', async () => {
    const result = await authService.login('test@example.com', 'password123');

    expect(result).toEqual({ access_token: 'mock_token' });
    expect(mockJwtService.sign).toHaveBeenCalledOnce();
  });

  it('should throw error for missing email or password', async () => {
    await expect(authService.login('', '')).rejects.toThrow('Email and password are required');
  });

  it('should throw error for invalid credentials', async () => {
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(authService.login('test@example.com', 'wrongpassword'))
      .rejects.toThrow('Invalid credentials');
  });
});