import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsString({ message: 'Nome da Organization precisa ser um texto' })
  @IsNotEmpty({ message: 'Nome da Organization não pode ser nulo' })
  organizationName: string;

  @IsString({ message: 'CNPJ precisa ser um texto' })
  @IsNotEmpty({ message: 'CNPJ não pode ser nulo' })
  cnpj: string;

  attachment: string;
  registered: boolean;
}
