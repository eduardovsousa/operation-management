import { Module } from '@nestjs/common';
import { GestorController } from './gestor.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { GestorService } from './services/gestor.service';
import { ValidateGestorOwnershipService } from './services/validate-gestor-ownership.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [GestorController],
  providers: [GestorService, ValidateGestorOwnershipService],
})
export class GestorModule {}
