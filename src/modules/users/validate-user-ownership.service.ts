import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/shared/database/repositories/users.repositories';

@Injectable()
export class ValidateUserOwnershipService {
  constructor(private readonly userRepo: UserRepository) { }

  async validate(userId: string) {
    const user = await this.userRepo.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}
