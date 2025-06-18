import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'test_secret',
      signOptions: { expiresIn: '1h' }
    })
  ],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}