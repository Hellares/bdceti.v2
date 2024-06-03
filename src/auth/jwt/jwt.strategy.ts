import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './jwt.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const dni =   payload.dni;
    const user = await this.userRepository.findOneBy({dni})
    if(!user)
      throw new UnauthorizedException('Token no valido');
    if(!user.isActive)
      throw new UnauthorizedException('Usuario inactivo, comuniquese con el administrador');
    //console.log(user);
    return { userId: payload.id, userDni: payload.dni, userName: payload.name, userIsActive: payload.isActive, roles: payload.roles };
    //return user;
  }
}