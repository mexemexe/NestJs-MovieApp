import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(email: string, password: string) {
    // Mock user validation 
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Simulate user lookup and password check
    const user = {
      id: '1',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10)
    };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.signToken(payload)
    };
  }

  // Separate method for easier testing
  signToken(payload: any) {
    return this.jwtService.sign(payload);
  }
}