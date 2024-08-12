import { Injectable, NotFoundException } from '@nestjs/common';
import { AssistantRepository } from 'src/shared/database/repositories/assistant.repositories';

@Injectable()
export class ValidateAssistantOwnershipService {
  constructor(private readonly assistantRepo: AssistantRepository) {}

  async validate(userId: string, assistantId: string) {
    const isOwner = await this.assistantRepo.findFirst({
      where: { id: assistantId, userId },
    });

    if (!isOwner) {
      throw new NotFoundException('assistant não encontrado');
    }
  }
}
