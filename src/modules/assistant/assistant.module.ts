import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AssistantService } from './services/assistant.service';
import { ValidateAssistantOwnershipService } from './services/validate-assistant-ownership.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [AssistantController],
  providers: [AssistantService, ValidateAssistantOwnershipService],
})
export class AssistantModule {}
