/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prismaService: PrismaService) { }

  findMany(findManyDto: Prisma.OrganizationFindManyArgs) {
    return this.prismaService.organization.findMany(findManyDto);
  }

  findUnique(findUniqueDto: Prisma.OrganizationFindUniqueArgs) {
    return this.prismaService.organization.findUnique(findUniqueDto);
  }

  findFirst(findFirstDto: Prisma.OrganizationFindFirstArgs) {
    return this.prismaService.organization.findFirst(findFirstDto);
  }

  create(createDto: Prisma.OrganizationCreateArgs) {
    return this.prismaService.organization.create(createDto);
  }

  update(updateDto: Prisma.OrganizationUpdateArgs) {
    return this.prismaService.organization.update(updateDto);
  }

  delete(deleteDto: Prisma.OrganizationDeleteArgs) {
    return this.prismaService.organization.delete(deleteDto);
  }
}
