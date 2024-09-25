import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }
  // USER++
  async register(createUserDto: CreateUserDto): Promise<{ statusCode: number; message: string }> {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        message: 'Usuario registrado con éxito.',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      this.logger.error(`Error in register ${createUserDto.userName}`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al registrar el usuario.';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al registrar el usuario.',
        );
      }
    }
  }
  // USER++
  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: { email, isActive: true },
        select: { email: true, password: true, id: true, userName: true },
      });

      if (!user) throw new UnauthorizedException('Credenciales inválidas (email)');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credeciales inválidas (password)');
      delete user.password;
      return {
        user,
        token: this.getJwtToken({ id: user.id }),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(`Error in login ${loginUserDto.email}`, error);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al registrar el usuario.';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al registrar el usuario.',
        );
      }
    }
  }
  // USER++
  async getUserData(user: User) {
    try {
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
      });
      return userData;
    } catch (error) {
      this.logger.error(`Error in getUserData UserId: ${user.id}`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al registrar el usuario.';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al registrar el usuario.',
        );
      }
    }

  }
  // CERRAR SESIÓN
  // REFRESCAR TOKEN

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }
  // SERVER++
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
