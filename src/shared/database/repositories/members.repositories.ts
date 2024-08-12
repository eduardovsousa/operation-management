/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class MembersRepository {
  constructor(private readonly prismaService: PrismaService) { }

  count(countDto: Prisma.MemberCountArgs) {
    return this.prismaService.member.count(countDto);
  }

  findMany(findManyDto: Prisma.MemberFindManyArgs) {
    return this.prismaService.member.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.MemberFindFirstArgs) {
    return this.prismaService.member.findFirst(findFirstDto);
  }

  create(createDto: Prisma.MemberCreateArgs) {
    return this.prismaService.member.create(createDto);
  }
  
  update(updateDto: Prisma.MemberUpdateArgs) {
    return this.prismaService.member.update(updateDto);
  }

  delete(deleteDto: Prisma.MemberDeleteArgs) {
    return this.prismaService.member.delete(deleteDto);
  }
}
