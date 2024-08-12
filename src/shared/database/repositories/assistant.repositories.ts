/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class AssistantRepository {
  constructor(private readonly prismaService: PrismaService) { }

  count(countDto: Prisma.AssistantCountArgs) {
    return this.prismaService.assistant.count(countDto);
  }

  findMany(findManyDto: Prisma.AssistantFindManyArgs) {
    return this.prismaService.assistant.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.AssistantFindFirstArgs) {
    return this.prismaService.assistant.findFirst(findFirstDto);
  }

  create(createDto: Prisma.AssistantCreateArgs) {
    return this.prismaService.assistant.create(createDto);
  }
  
  update(updateDto: Prisma.AssistantUpdateArgs) {
    return this.prismaService.assistant.update(updateDto);
  }

  delete(deleteDto: Prisma.AssistantDeleteArgs) {
    return this.prismaService.assistant.delete(deleteDto);
  }
}
