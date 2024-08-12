import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { MembersService } from './services/members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createMemberDto: CreateMemberDto,
  ) {
    return this.membersService.create(userId, createMemberDto);
  }

  @Get()
  findAll(@ActiveUserId() userId: string, @Query('team') team: string) {
    return this.membersService.findAllByUserId(userId, { team });
  }

  @Put(':memberId')
  update(
    @ActiveUserId() userId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(userId, memberId, updateMemberDto);
  }

  @Delete(':memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @ActiveUserId() userId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.membersService.remove(userId, memberId);
  }
}
