import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIP,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin@fastery.dev',
    description: 'The email of the User',
    format: 'email',
    nullable: false
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'The username of the User',
    format: 'text',
    nullable: false
  })
  @IsString()
  userName: string;

  @ApiProperty({
    example: '192.168.0.101',
    description: 'The ip address of the User',
    nullable: false,
  })
  @IsString({ message: 'La dirección IP debe ser un texto' })
  @IsIP(null, { message: 'La dirección IP debe ser válida' })
  ipRegister: string;

  @ApiProperty({
    example: 'Abc123',
    description: 'The password of the User',
    format: 'text',
    nullable: false
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una letra mayúscula, una minúscula y un número.',
  })
  password: string;
}
