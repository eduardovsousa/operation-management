import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { OrganizationRepository } from 'src/shared/database/repositories/organizations.repositories';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { ValidateOrganizationOwnershipService } from './validate-organizations-ownership.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepo: OrganizationRepository,
    private readonly validateOrganizationOwnershipService: ValidateOrganizationOwnershipService,
  ) { }

  async create(
    userId: string,
    createOrganizationDto: CreateOrganizationDto,
    attachmentFiles: Express.Multer.File[]) {
    if (!this.isPDF(attachmentFiles[0])) {
      throw new ConflictException('O arquivo deve ser um PDF.');
    }

    const MAX_SIZE = 1 * 1024 * 1024;
    if (attachmentFiles[0].size > MAX_SIZE) {
      throw new ConflictException(
        `O tamanho do attachment (${attachmentFiles[0].filename}) deve ser igual ou menor que 1MB attachment`,
      );
    }

    const { organizationName, cnpj } = createOrganizationDto;

    let imagePath: string;

    try {
      imagePath = await this.uploadImage(userId, attachmentFiles[0]);
    } catch (error) {
      throw new ConflictException('Erro ao fazer upload da imagem.');
    }

    return this.organizationsRepo.create({
      data: {
        userId,
        organizationName,
        cnpj,
        registered: false,
        attachment: imagePath,
      },
    });
  }

  findAllByUserId(userId: string) {
    return this.organizationsRepo.findMany({
      where: { userId },
      include: {
        members: true,
      },
    });
  }

  async updateMasc(
    userId: string,
    organizationId: string,
    updateOrganizationDto: UpdateOrganizationDto,
    file: Express.Multer.File,
  ) {
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new ConflictException(
        'O tamanho do attachment deve ser igual ou menor que 3 MB',
      );
    }

    if (!this.isPDF(file)) {
      throw new ConflictException('O arquivo deve ser um PDF.');
    }


    await this.validateOrganizationOwnershipService.validate(userId, organizationId);

    let documentosPath: string;

    if (file) {
      try {
        const organizationAntiga = await this.organizationsRepo.findFirst({
          where: { id: organizationId },
          select: { documentsTeam: true },
        });

        if (organizationAntiga && organizationAntiga.documentsTeam) {
          await this.deleteFile(organizationAntiga.documentsTeam);
        }

        documentosPath = await this.uploadImage(userId, file);
      } catch (error) {
        throw new BadRequestException('Erro ao fazer upload do documento.');
      }
    }

    return this.organizationsRepo.update({
      where: { id: organizationId },
      data: {
        documentsTeam:
          documentosPath || updateOrganizationDto.documentsTeam,
        registered: false,
      },
    });
  }


  async remove(userId: string, organizationId: string) {
    await this.validateOrganizationOwnershipService.validate(userId, organizationId);

    await this.organizationsRepo.delete({
      where: { id: organizationId },
    });

    return null;
  }

  private isPDF(file: Express.Multer.File): boolean {
    const allowedExtensions = ['.pdf'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    return allowedExtensions.includes(fileExtension);
  }

  private async uploadImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const randomNumber = generateRandomNumber();
    const uniqueFilename = `${Date.now()}-${randomNumber}${file.originalname}`;
    const userFolderPath = path.join('uploads', userId, 'Documentos');
    const uploadPath = path.join(userFolderPath, uniqueFilename);

    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    return new Promise<string>((resolve, reject) => {
      fs.writeFile(uploadPath, file.buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          const imagePath = `${userId}/Documentos/${uniqueFilename}`;
          resolve(imagePath);
        }
      });
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join('uploads', filePath);

    return new Promise<void>((resolve, reject) => {
      fs.unlink(fullPath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

function generateRandomNumber(): number {
  return Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
}
