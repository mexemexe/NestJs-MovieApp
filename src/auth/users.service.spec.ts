import { describe, it, expect, beforeEach } from 'vitest';
import { UsersService, User } from './users.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
  });

  describe('register', () => {
    const validUser: User = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully register a new user', async () => {
      const registeredUser = await usersService.register(validUser);

      expect(registeredUser).toHaveProperty('id');
      expect(registeredUser.username).toBe(validUser.username);
      expect(registeredUser.email).toBe(validUser.email);
      expect(registeredUser).not.toHaveProperty('password');
    });

    it('should throw BadRequestException for incomplete user data', async () => {
      const incompleteUser = { username: 'testuser' };
      
      await expect(usersService.register(incompleteUser as User))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for duplicate username', async () => {
      await usersService.register(validUser);

      const duplicateUser = { ...validUser, email: 'different@example.com' };
      await expect(usersService.register(duplicateUser))
        .rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      await usersService.register(validUser);

      const duplicateUser = { ...validUser, username: 'differentuser' };
      await expect(usersService.register(duplicateUser))
        .rejects.toThrow(ConflictException);
    });

    it('should increment user ID for each registration', async () => {
      const user1 = await usersService.register(validUser);
      const user2 = await usersService.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password456'
      });

      expect(user1.id).toBe(1);
      expect(user2.id).toBe(2);
    });
  });
});