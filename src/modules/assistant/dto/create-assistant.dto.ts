import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAssistantDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  rg: string;

  @IsString()
  @IsNotEmpty()
  team: string;

  @IsString()
  @IsNotEmpty()
  birthdate: string;
}
