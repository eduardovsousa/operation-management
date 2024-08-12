import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './services/organizations.service';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'attachment', maxCount: 1 },
  ]))
  create(
    @ActiveUserId() userId: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
    @UploadedFiles() files: { attachment?: Express.Multer.File[]},
  ) {
    return this.organizationsService.create(userId, createOrganizationDto, files.attachment);
  }

  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.organizationsService.findAllByUserId(userId);
  }

  @Put(':organizationId/team')
  @UseInterceptors(FileInterceptor('documentsTeam'))
  updateMasc(
    @ActiveUserId() userId: string,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.organizationsService.updateMasc(userId, organizationId, updateOrganizationDto, file);
  }

  @Delete(':organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @ActiveUserId() userId: string,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.organizationsService.remove(userId, organizationId);
  }
}
