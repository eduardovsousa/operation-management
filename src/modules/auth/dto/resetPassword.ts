import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'E-mail precisa ser um texto' })
  @IsNotEmpty({ message: 'E-mail não pode ser nulo' })
  @IsEmail()
  recipient_email: string;

  @IsInt({ message: 'Código OTP precisa ser um código numérico' })
  @IsNotEmpty({ message: 'Código OTP não pode ser nulo' })
  otpCode: number;
}
