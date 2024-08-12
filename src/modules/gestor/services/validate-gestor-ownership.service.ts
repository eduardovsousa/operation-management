import { Injectable, NotFoundException } from '@nestjs/common';
import { GestorRepository } from 'src/shared/database/repositories/gestor.repositories';

@Injectable()
export class ValidateGestorOwnershipService {
  constructor(private readonly gestorRepo: GestorRepository) {}

  async validate(userId: string, gestorId: string) {
    const isOwner = await this.gestorRepo.findFirst({
      where: { id: gestorId, userId },
    });

    if (!isOwner) {
      throw new NotFoundException('Gestor não encontrado');
    }
  }
}
