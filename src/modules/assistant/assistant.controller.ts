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
import { AssistantService } from './services/assistant.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createAssistantDto: CreateAssistantDto,
  ) {
    return this.assistantService.create(userId, createAssistantDto);
  }

  @Get()
  findAll(@ActiveUserId() userId: string, @Query('team') team: string) {
    return this.assistantService.findAllByUserId(userId, { team });
  }

  @Put(':assistantId')
  update(
    @ActiveUserId() userId: string,
    @Param('assistantId', ParseUUIDPipe) assistantId: string,
    @Body() updateAssistantDto: UpdateAssistantDto,
  ) {
    return this.assistantService.update(userId, assistantId, updateAssistantDto);
  }

  @Delete(':assistantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @ActiveUserId() userId: string,
    @Param('assistantId', ParseUUIDPipe) rg: string,
  ) {
    return this.assistantService.remove(userId, rg);
  }
}
