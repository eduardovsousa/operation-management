import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MembersService } from './services/members.service';
import { ValidateMembersOwnershipService } from './services/validate-member-ownership.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [MembersController],
  providers: [MembersService, ValidateMembersOwnershipService],
})
export class MembersModule {}
