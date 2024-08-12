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
import { GestorService } from './services/gestor.service';
import { CreateGestorDto } from './dto/create-gestor.dto';
import { UpdateGestorDto } from './dto/update-gestor.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';

@Controller('gestor')
export class GestorController {
  constructor(private readonly gestorService: GestorService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createGestorDto: CreateGestorDto,
  ) {
    return this.gestorService.create(userId, createGestorDto);
  }

  @Get()
  findAll(@ActiveUserId() userId: string, @Query('team') team: string) {
    return this.gestorService.findAllByUserId(userId, { team });
  }

  @Put(':gestorId')
  update(
    @ActiveUserId() userId: string,
    @Param('gestorId', ParseUUIDPipe) gestorId: string,
    @Body() updateGestorDto: UpdateGestorDto,
  ) {
    return this.gestorService.update(userId, gestorId, updateGestorDto);
  }

  @Delete(':gestorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @ActiveUserId() userId: string,
    @Param('gestorId', ParseUUIDPipe) gestorId: string,
  ) {
    return this.gestorService.remove(userId, gestorId);
  }
}
