import { IsOptional, IsString } from 'class-validator';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends CreateOrganizationDto {
  @IsString({ message: 'Documentos do Time TI precisa ser um texto' })
  @IsOptional()
  documentsTeam?: string;
}
