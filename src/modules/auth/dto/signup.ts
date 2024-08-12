import { IsEmail, IsString, IsNotEmpty, MinLength, Matches, IsBoolean } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Nome precisa ser um texto' })
  @IsNotEmpty({ message: 'Nome não pode ser nulo' })
  firstName: string;

  @IsString({ message: 'Sobrenome precisa ser um texto' })
  @IsNotEmpty({ message: 'Sobrenome não pode ser nulo' })
  lastName: string;

  @IsString({ message: 'E-mail precisa ser um texto' })
  @IsNotEmpty({ message: 'E-mail não pode ser nulo' })
  @IsEmail()
  email: string;

  @IsString({ message: 'RG precisa ser um texto' })
  @IsNotEmpty({ message: 'RG não pode ser nulo' })
  rg: string;

  @IsString()
  @IsNotEmpty()
  birthdate: string;

  @IsString({ message: 'Telefone precisa ser um texto' })
  @IsNotEmpty({ message: 'Telefone não pode ser nulo' })
  @MinLength(11)
  phone: string;

  @IsString({ message: 'Nome da organization precisa ser um texto' })
  @IsNotEmpty({ message: 'Nome da organization não pode ser nulo' })
  organizationName: string;

  @IsString({ message: 'CNPJ precisa ser um valor válido' })
  @IsNotEmpty({ message: 'CNPJ não pode ser nulo' })
  cnpj: string;

  attachment: string;
  role: string;

  @IsString({ message: 'Senha precisa ser um texto' })
  @IsNotEmpty({ message: 'Senha não pode ser nulo' })
  @MinLength(8)
  password: string;

  @IsString({ message: 'Confirmação de senha precisa ser um texto' })
  @IsNotEmpty({ message: 'Confirmação de senha não pode ser nulo' })
  @MinLength(8)
  confirmPassword: string;
}