import { Injectable, NotFoundException } from '@nestjs/common';
import { MembersRepository } from 'src/shared/database/repositories/members.repositories';

@Injectable()
export class ValidateMembersOwnershipService {
  constructor(private readonly membersRepo: MembersRepository) {}

  async validate(userId: string, memberId: string) {
    const isOwner = await this.membersRepo.findFirst({
      where: { id: memberId, userId },
    });

    if (!isOwner) {
      throw new NotFoundException('Member não encontrado');
    }
  }
}
