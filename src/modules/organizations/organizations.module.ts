import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './services/organizations.service';
import { ValidateOrganizationOwnershipService } from './services/validate-organizations-ownership.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, ValidateOrganizationOwnershipService],
  exports: [ValidateOrganizationOwnershipService],
})
export class OrganizationsModule {}
