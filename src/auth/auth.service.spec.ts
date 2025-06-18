import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn().mockReturnValue('mocked_jwt_token')
          }
        }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should login successfully with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await authService.login('test@example.com', 'password123');

    expect(result).toHaveProperty('access_token');
    expect(jwtService.sign).toHaveBeenCalled();
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