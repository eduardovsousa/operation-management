import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { MembersModule } from './modules/members/members.module';
import { GestorModule } from './modules/gestor/gestor.module';
import { AssistantModule } from './modules/assistant/assistant.module';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    MembersModule,
    GestorModule,
    AssistantModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
