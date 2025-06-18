import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  async register(userData: User): Promise<User> {
    // Validate input
    if (!userData.username || !userData.email || !userData.password) {
      throw new BadRequestException('All fields are required');
    }

    // Check for existing user
    const existingUser = this.users.find(
      user => user.username === userData.username || user.email === userData.email
    );

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Create new user with incremental ID
    const newUser = {
      ...userData,
      id: this.users.length + 1
    };

    this.users.push(newUser);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  }

  // Helper method for testing
  getAllUsers(): User[] {
    return this.users;
  }
}