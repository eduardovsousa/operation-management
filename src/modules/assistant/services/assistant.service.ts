import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAssistantDto } from '../dto/create-assistant.dto';
import { UpdateAssistantDto } from '../dto/update-assistant.dto';
import { AssistantRepository } from 'src/shared/database/repositories/assistant.repositories';
import { ValidateAssistantOwnershipService } from './validate-assistant-ownership.service';
import { ValidateOrganizationOwnershipService } from 'src/modules/organizations/services/validate-organizations-ownership.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly assistantRepo: AssistantRepository,
    private readonly validateOrganizationOwnershipService: ValidateOrganizationOwnershipService,
    private readonly validateAssistantOwnershipService: ValidateAssistantOwnershipService,
  ) {}

  async countAssistant(
    userId: string,
    organizationId: string,
    team: string,
  ): Promise<number> {
    return this.assistantRepo.count({
      where: {
        userId,
        organizationId,
        team,
      },
    });
  }

  async create(userId: string, createAssistantDto: CreateAssistantDto) {
    const {
      organizationId,
      organizationName,
      firstName,
      lastName,
      rg,
      team,
      birthdate,
    } = createAssistantDto;

    await this.validateEntitiesOwnership({
      userId,
      organizationId,
    });

    const totalAssistant = await this.countAssistant(userId, organizationId, team);
    const maxAssistantPerTime = 1;

    if (totalAssistant >= maxAssistantPerTime) {
      throw new ConflictException(
        `Limite de assistentes para o time ${team} atingido!`,
      );
    }

    const rgTaken = await this.assistantRepo.findFirst({
      where: { rg },
      select: { id: true },
    });

    if (rgTaken) {
      throw new ConflictException('Este RG já está cadastrado!');
    }

    return this.assistantRepo.create({
      data: {
        userId,
        organizationId,
        organizationName,
        firstName,
        lastName,
        rg,
        team,
        birthdate,
      },
    });
  }

  findAllByUserId(userId: string, filters: { team?: string }) {
    return this.assistantRepo.findMany({
      where: {
        userId,
        team: {
          contains: filters?.team,
        },
      },
    });
  }

  async update(
    userId: string,
    assistantId: string,
    updateAssistantDto: UpdateAssistantDto,
  ) {
    const { organizationId, firstName, lastName, rg, team, birthdate } = updateAssistantDto;
  
    await this.validateEntitiesOwnership({
      userId,
      organizationId,
      assistantId,
    });
  
    const rgTaken = await this.assistantRepo.findFirst({
      where: { rg },
      select: { id: true },
    });
    if (rgTaken && rgTaken.id !== assistantId) {
      throw new ConflictException('Este RG já está cadastrado!');
    }
  
    const existingAssistant = await this.assistantRepo.findFirst({
      where: { id: assistantId },
    });
  
    if (existingAssistant.team !== updateAssistantDto.team) {
      const totalAssistantsInNewTeam = await this.countAssistant(
        userId,
        updateAssistantDto.organizationId,
        updateAssistantDto.team
      );
  
      if (totalAssistantsInNewTeam >= 1) {
        throw new ConflictException(
          `Limite de assistentes para o time ${updateAssistantDto.team} atingido!`
        );
      }
    }
  
    return this.assistantRepo.update({
      where: { id: assistantId },
      data: {
        organizationId,
        firstName,
        lastName,
        rg,
        team,
        birthdate,
      },
    });
  }

  async remove(userId: string, assistantId: string) {
    await this.validateEntitiesOwnership({
      userId,
      assistantId,
    });

    await this.assistantRepo.delete({
      where: { id: assistantId },
    });

    return null;
  }

  private async validateEntitiesOwnership({
    userId,
    organizationId,
    assistantId,
  }: {
    userId: string;
    organizationId?: string;
    assistantId?: string;
  }) {
    await Promise.all([
      assistantId &&
        this.validateAssistantOwnershipService.validate(userId, assistantId),
      organizationId &&
        this.validateOrganizationOwnershipService.validate(userId, organizationId),
    ]);
  }
}
