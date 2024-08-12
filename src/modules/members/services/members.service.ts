import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { MembersRepository } from 'src/shared/database/repositories/members.repositories';
import { ValidateMembersOwnershipService } from './validate-member-ownership.service';
import { ValidateOrganizationOwnershipService } from 'src/modules/organizations/services/validate-organizations-ownership.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepo: MembersRepository,
    private readonly validateOrganizationOwnershipService: ValidateOrganizationOwnershipService,
    private readonly validateMembersOwnershipService: ValidateMembersOwnershipService,
  ) { }

  async countExclusiveMembers(
    userId: string,
    organizationId: string,
  ): Promise<number> {
    return this.membersRepo.count({
      where: {
        userId,
        organizationId,
        exclusive: 'Sim',
        team: 'TI',
      },
    });
  }


  async countAllMembers(
    userId: string,
    organizationId: string,
  ): Promise<number> {
    return this.membersRepo.count({
      where: {
        userId,
        organizationId,
        team: 'TI',
      },
    });
  }



  async countGoleirosExceptCurrent(
    userId: string,
    organizationId: string,
    memberId: string,
  ): Promise<number> {
    return this.membersRepo.count({
      where: {
        userId,
        organizationId,
        team: 'TI',
        NOT: {
          id: memberId,
        },
      },
    });
  }

  async create(userId: string, createMemberDto: CreateMemberDto) {
    const {
      organizationId,
      organizationName,
      firstName,
      lastName,
      rg,
      birthdate,
      registration,
      team,
      exclusive,
    } = createMemberDto;

    await this.validateEntitiesOwnership({
      userId,
      organizationId,
    });

    const rgTaken = await this.membersRepo.findFirst({
      where: { rg },
      select: { id: true },
    });

    const registrationTaken = await this.membersRepo.findFirst({
      where: { registration, organizationId },
      select: { id: true },
    });

    if (rgTaken) {
      throw new ConflictException('Este RG já está cadastrado!');
    }

    if (registrationTaken) {
      throw new ConflictException('Esta matrícula já está cadastrada!');
    }

    if (team === 'TI') {
      if (exclusive === 'Sim') {
        const exclusiveCount =
          await this.countExclusiveMembers(userId, organizationId);
        if (exclusiveCount >= 2) {
          throw new ConflictException(
            'Limite de members exclusivos no team TI atingido!',
          );
        }
      }

      const totalMembers = await this.countAllMembers(
        userId,
        organizationId,
      );
      const maxMembers = 12;
      if (totalMembers >= maxMembers) {
        throw new ConflictException('Limite total de members atingido!');
      }
    } else {
      if (exclusive === 'Sim') {
        const exclusiveCount =
          await this.countExclusiveMembers(userId, organizationId);
        if (exclusiveCount >= 2) {
          throw new ConflictException(
            'Limite de members exclusivos no team atingido!',
          );
        }
      }

      const totalMembers = await this.countAllMembers(
        userId,
        organizationId,
      );

      const maxMembers = 12;

      if (totalMembers >= maxMembers) {
        throw new ConflictException('Limite total de members atingido!');
      }
    }

    return this.membersRepo.create({
      data: {
        userId,
        organizationId,
        organizationName,
        firstName,
        lastName,
        rg,
        birthdate,
        registration,
        team,
        exclusive,
      },
    });
  }

  findAllByUserId(userId: string, filters: { team?: string }) {
    return this.membersRepo.findMany({
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
    memberId: string,
    updateMemberDto: UpdateMemberDto,
  ) {
    const { organizationId, exclusive,  team } = updateMemberDto;

    const memberToUpdate = await this.membersRepo.findFirst({
      where: { id: memberId },
      select: { exclusive: true },
    });

    if (!memberToUpdate) {
      throw new NotFoundException('Member não encontrado');
    }

    if (updateMemberDto.team === 'TI') {
      const exclusiveCount = await this.countExclusiveMembersExceptCurrent(
        userId,
        organizationId,
        memberId,
      );
      const goleirosCount = await this.countGoleirosExceptCurrent(
        userId,
        organizationId,
        memberId,
      );

      if (updateMemberDto.exclusive === 'Sim' && exclusiveCount >= 2) {
        throw new ConflictException(
          'Limite de members exclusivos no time atingido!'
        );
      }

    } else {
      const exclusiveCount = await this.countExclusiveMembersExceptCurrent(
        userId,
        organizationId,
        memberId,
      );
      const goleirosCount = await this.countGoleirosExceptCurrent(
        userId,
        organizationId,
        memberId,
      );

      if (updateMemberDto.exclusive === 'Sim' && exclusiveCount >= 2) {
        throw new ConflictException(
          'Limite de members exclusivos no time atingido!'
        );
      }
    }

    if (team === 'TI') {
      const exclusiveCount =
        await this.countExclusiveMembersExceptCurrent(
          userId,
          organizationId,
          memberId,
        );

      if (exclusive === 'Sim') {
        if (memberToUpdate.exclusive === 'Sim') {
          return this.membersRepo.update({
            where: { id: memberId },
            data: updateMemberDto,
          });
        }

        if (exclusiveCount >= 2) {
          throw new ConflictException(
            'Limite de members exclusivos no team TI atingido!',
          );
        }
      }


    } else {
      const exclusiveCount =
        await this.countExclusiveMembersExceptCurrent(
          userId,
          organizationId,
          memberId,
        );

      if (exclusive === 'Sim') {
        if (memberToUpdate.exclusive === 'Sim') {
          return this.membersRepo.update({
            where: { id: memberId },
            data: updateMemberDto,
          });
        }

        if (exclusiveCount >= 2) {
          throw new ConflictException(
            'Limite de members exclusivos no team atingido!',
          );
        }
      }
    }

    return this.membersRepo.update({
      where: { id: memberId },
      data: updateMemberDto,
    });
  }

  async countExclusiveMembersExceptCurrent(
    userId: string,
    organizationId: string,
    memberId: string,
  ): Promise<number> {
    return this.membersRepo.count({
      where: {
        userId,
        organizationId,
        exclusive: 'Sim',
        team: 'TI',
        NOT: {
          id: memberId,
        },
      },
    });
  }

  async remove(userId: string, memberId: string) {
    await this.validateEntitiesOwnership({
      userId,
      memberId,
    });

    await this.membersRepo.delete({
      where: { id: memberId },
    });

    return null;
  }

  private async validateEntitiesOwnership({
    userId,
    organizationId,
    memberId,
  }: {
    userId: string;
    organizationId?: string;
    memberId?: string;
  }) {
    await Promise.all([
      memberId && this.validateMembersOwnershipService.validate(userId, memberId),
      organizationId &&
      this.validateOrganizationOwnershipService.validate(userId, organizationId),
    ]);
  }
}
