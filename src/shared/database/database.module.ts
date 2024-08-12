import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepository } from './repositories/users.repositories';
import { OrganizationRepository } from './repositories/organizations.repositories';
import { MembersRepository } from './repositories/members.repositories';
import { GestorRepository } from './repositories/gestor.repositories';
import { AssistantRepository } from './repositories/assistant.repositories';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    OrganizationRepository,
    MembersRepository,
    GestorRepository,
    AssistantRepository,
  ],
  exports: [
    UserRepository,
    OrganizationRepository,
    MembersRepository,
    GestorRepository,
    AssistantRepository,
  ],
})
export class DatabaseModule {}
