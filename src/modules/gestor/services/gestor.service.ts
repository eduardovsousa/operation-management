import { ConflictException, Injectable } from '@nestjs/common';
import { CreateGestorDto } from '../dto/create-gestor.dto';
import { UpdateGestorDto } from '../dto/update-gestor.dto';
import { GestorRepository } from 'src/shared/database/repositories/gestor.repositories';
import { ValidateGestorOwnershipService } from './validate-gestor-ownership.service';
import { ValidateOrganizationOwnershipService } from 'src/modules/organizations/services/validate-organizations-ownership.service';

@Injectable()
export class GestorService {
  constructor(
    private readonly gestorRepo: GestorRepository,
    private readonly validateOrganizationOwnershipService: ValidateOrganizationOwnershipService,
    private readonly validateGestorOwnershipService: ValidateGestorOwnershipService,
  ) { }

  async countCoach(
    userId: string,
    organizationId: string,
    team: string,
  ): Promise<number> {
    return this.gestorRepo.count({
      where: {
        userId,
        organizationId,
        team,
      },
    });
  }

  async create(userId: string, createGestorDto: CreateGestorDto) {
    const {
      organizationId,
      organizationName,
      firstName,
      lastName,
      rg,
      team,
      birthdate,
    } = createGestorDto;

    await this.validateEntitiesOwnership({
      userId,
      organizationId,
    });

    const totalCoach = await this.countCoach(userId, organizationId, team);
    const maxCoachPerTime = 1;

    if (totalCoach >= maxCoachPerTime) {
      throw new ConflictException(
        `Limite de gestor para o time ${team} atingido!`,
      );
    }

    return this.gestorRepo.create({
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
    return this.gestorRepo.findMany({
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
    gestorId: string,
    updateGestorDto: UpdateGestorDto,
  ) {
    const { organizationId, firstName, lastName, rg, team, birthdate } = updateGestorDto;

    await this.validateEntitiesOwnership({
      userId,
      organizationId,
      gestorId,
    });

    const existingCoach = await this.gestorRepo.findFirst({
      where: { id: gestorId },
    });

    if (existingCoach.team !== updateGestorDto.team) {
      const totalgestorsInNewTeam = await this.countCoach(
        userId,
        updateGestorDto.organizationId,
        updateGestorDto.team
      );

      if (totalgestorsInNewTeam >= 1) {
        throw new ConflictException(
          `Limite de gestor para o time ${updateGestorDto.team} atingido!`
        );
      }
    }

    return this.gestorRepo.update({
      where: { id: gestorId },
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

  async remove(userId: string, gestorId: string) {
    await this.validateEntitiesOwnership({
      userId,
      gestorId,
    });

    await this.gestorRepo.delete({
      where: { id: gestorId },
    });

    return null;
  }

  private async validateEntitiesOwnership({
    userId,
    organizationId,
    gestorId,
  }: {
    userId: string;
    organizationId?: string;
    gestorId?: string;
  }) {
    await Promise.all([
      gestorId &&
      this.validateGestorOwnershipService.validate(userId, gestorId),
      organizationId &&
      this.validateOrganizationOwnershipService.validate(userId, organizationId),
    ]);
  }
}
