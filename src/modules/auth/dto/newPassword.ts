import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class NewPasswordDto {
  @IsString({ message: 'E-mail precisa ser um texto' })
  @IsNotEmpty({ message: 'E-mail não pode ser nulo' })
  @IsEmail()
  recipient_email: string;

  @IsString({ message: 'Senha não pode ser nula' })
  @IsNotEmpty({ message: 'Senha não pode ser nula' })
  @MinLength(8)
  password: string;
  
  @IsString({ message: 'Confirmação de senha não pode ser nula' })
  @IsNotEmpty({ message: 'Confirmação de senha não pode ser nula' })
  @MinLength(8)
  confirmPassword: string;
}
