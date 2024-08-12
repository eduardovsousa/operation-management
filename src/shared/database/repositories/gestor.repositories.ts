/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class GestorRepository {
  constructor(private readonly prismaService: PrismaService) { }

  count(countDto: Prisma.GestorCountArgs) {
    return this.prismaService.gestor.count(countDto);
  }

  findMany(findManyDto: Prisma.GestorFindManyArgs) {
    return this.prismaService.gestor.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.GestorFindFirstArgs) {
    return this.prismaService.gestor.findFirst(findFirstDto);
  }

  create(createDto: Prisma.GestorCreateArgs) {
    return this.prismaService.gestor.create(createDto);
  }
  
  update(updateDto: Prisma.GestorUpdateArgs) {
    return this.prismaService.gestor.update(updateDto);
  }

  delete(deleteDto: Prisma.GestorDeleteArgs) {
    return this.prismaService.gestor.delete(deleteDto);
  }
}
