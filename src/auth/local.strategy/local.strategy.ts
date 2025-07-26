import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '.././auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'cpf' }); // Informa ao Passport que usaremos 'cpf' em vez de 'username'
  }

  async validate(cpf: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(cpf, password);
    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos.');
    }
    return user;
  }
}