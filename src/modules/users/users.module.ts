import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ValidateUserOwnershipService } from './validate-user-ownership.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ValidateUserOwnershipService],
})
export class UsersModule {}
