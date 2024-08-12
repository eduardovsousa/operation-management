import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SigninDto {
  @IsString({ message: 'E-mail precisa ser um texto' })
  @IsNotEmpty({ message: 'E-mail não pode ser nulo' })
  @IsEmail()
  email: string;

  @IsString({ message: 'Senha precisa ser um texto' })
  @IsNotEmpty({ message: 'Senha não pode ser nulo' })
  @MinLength(8)
  password: string;
}
