import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from 'src/shared/database/repositories/organizations.repositories';

@Injectable()
export class ValidateOrganizationOwnershipService {
  constructor(private readonly organizationsRepo: OrganizationRepository) {}

  async validate(userId: string, organizationId: string) {
    const isOwner = await this.organizationsRepo.findFirst({
      where: { id: organizationId, userId },
    });

    if (!isOwner) {
      throw new NotFoundException('Organization não encontrada');
    }
  }
}
