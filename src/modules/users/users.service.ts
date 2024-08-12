import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/shared/database/repositories/users.repositories';
import { OrganizationRepository } from 'src/shared/database/repositories/organizations.repositories';
import { ValidateUserOwnershipService } from './validate-user-ownership.service';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import { env } from 'src/shared/config/env';

const resend = new Resend(env.resendToken);
@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UserRepository,
    private readonly organizationRepo: OrganizationRepository,
    private readonly validateUserOwnershipService: ValidateUserOwnershipService) { }

  async getUserById(userId: string) {
    return this.usersRepo.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthdate: true,
      },
    });
  }

  async sendRegister(userId: string, type: string) {
    const user = await this.usersRepo.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        rg: true,
        email: true,
        phone: true,
        birthdate: true
      },
    });

    const organizationData = await this.organizationRepo.findFirst({
      where: { userId: userId },
      select: {
        id: true,
        organizationName: true,
        cnpj: true,
        attachment: true,
        documentsTeam: true,
        registered: true,
        members: {
          select: {
            firstName: true,
            lastName: true,
            rg: true,
            birthdate: true,
            registration: true,
            team: true,
            exclusive: true,
          },
        },
        gestors: {
          select: {
            firstName: true,
            lastName: true,
            rg: true,
            team: true,
            birthdate: true,
          },
        },
        assistants: {
          select: {
            firstName: true,
            lastName: true,
            rg: true,
            team: true,
            birthdate: true,
          },
        },
      },
    });

    if (!organizationData) {
      throw new NotFoundException('Organization não encontrada para o usuário.');
    }

    let registeredField: boolean;
    if (type === 'TI') {
      registeredField = organizationData.registered;
    } else {
      throw new BadRequestException('Gênero inválido.');
    }

    if (registeredField) {
      return new ConflictException("Organization já está registrada")
    } else {
      const formattedGestorDetails = this.formatGestorDetails(organizationData, user, type);

      await resend.emails.send({
        from: 'Uma organization se inscreveu! <onboarding@resend.dev>',
        to: "eduardo.sousa@17com.com.br",
        subject: `Nova inscrição - (${type})`,
        html: `<!doctype html>
      <html lang="pt-br">
      <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Resete de senha</title>
          <meta name="description" content="Reset de senha">
          <style type="text/css">
              a:hover {text-decoration: underline !important;}
          </style>
      </head>
      <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
              style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
              <tr>
                  <td>
                      <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                          align="center" cellpadding="0" cellspacing="0">
                          <tr>
                              <td style="height:80px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="height:20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td>
                                  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                      style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                      <tr>
                                          <td style="padding:0 35px;">
                                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Você recebeu uma nova inscrição!</h1>
                                              <span
                                                  style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Verifique os dados abaixo para confirmar a aprovação da participação da organization:</p>
      <div style="text-decoration:none !important;font-weight:500;margin-top:35px;color:#000;font-size:14px;padding:10px 0px;display:inline-block;border-radius: 4px;display: flex;flex-direction: column;align-items: start;justify-content: start;">
          ${formattedGestorDetails}
      </div>
            <p style="color:#455056; font-size:15px;line-height:24px; margin:35px 0 0 0;font-style: italic;">Caso encontre algum problema, entre em contato com o desenvolvedor.</p>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                  </table>
                              </td>
                          <tr>
                              <td style="height:20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="height:80px;">&nbsp;</td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>`
      });

      if (type === "TI") {
        await this.organizationRepo.update({
          where: { id: organizationData.id },
          data: {
            registered: true
          }
        });
      }
    }
  }

  async remove(userId: string, id: string) {
    if (userId !== id) {
      throw new ConflictException("Você não tem autorização para deletar essa conta.")
    }

    await this.validateUserOwnershipService.validate(id);

    const user = await this.usersRepo.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthdate: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const userFolderPath = path.join('uploads', user.id);

    if (fs.existsSync(userFolderPath)) {
      fs.rmdirSync(userFolderPath, { recursive: true });
    }

    await this.usersRepo.delete({
      where: { id },
    });

    return null;
  }

  private formatPersonDetails(personList: any[], type: string) {
    return personList
      .filter(person => person.team === type)
      .map(person => `
      <li style="text-align: start">
          <p><strong>Nome:</strong> ${person.firstName} ${person.lastName}</p>
          <p><strong>RG:</strong> ${person.rg}</p>
          <p><strong>Time:</strong> ${person.team}</p>
          <p><strong>Data de Nascimento:</strong> ${person.birthdate}</p>
      </li>
  `)
      .join('');
  }

  private formatMemberDetails(memberList: any[], type: string) {
    return memberList
      .filter(member => member.team === type)
      .map(member => `
      <li style="text-align: start">
          <p><strong>Nome:</strong> ${member.firstName} ${member.lastName}</p>
          <p><strong>RG:</strong> ${member.rg}</p>
          <p><strong>Time:</strong> ${member.team}</p>
          <p><strong>Data de Nascimento:</strong> ${member.birthdate}</p>
          <p><strong>Matrícula:</strong> ${member.registration}</p>
          <p><strong>Exclusivo:</strong> ${member.exclusive}</p>
      </li>
  `)
      .join('');
  }

  private formatGestorDetails(organizationData: any, user: any, type: string) {
    return `
    <p><strong>*** Dados do responsável ***</strong></p>
    <p><strong>Nome:</strong> ${user.firstName} ${user.lastName}</p>
    <p><strong>RG:</strong> ${user.rg}</p>
    <p><strong>E-mail:</strong> ${user.email}</p>
    <p><strong>Telefone:</strong> ${user.phone}</p>
    <p><strong>Data de Nascimento:</strong> ${user.birthdate}</p>
    <p><strong>*** Dados do organization ***</strong></p>
    <p><strong>Nome da Organization:</strong> ${organizationData.organizationName}</p>
    <p><strong>CNPJ:</strong> ${organizationData.cnpj}</p>
    <p><strong>Inscrição para o time ${type}*:</strong></p>
    <p><strong>*** Dados dos members ***</strong></p>
    <ul style="text-align: start">
        ${this.formatMemberDetails(organizationData.members, type)}
    </ul>
    <p><strong>*** Dados do gestor ***</strong></p>
    <ul style="text-align: start">
        ${this.formatPersonDetails(organizationData.gestor, type)}
    </ul>
    <p><strong>*** Dados do assistant ***</strong></p>
    <ul style="text-align: start">
        ${this.formatPersonDetails(organizationData.assistant, type)}
    </ul>
    <div style="display: flex;flex-direction: column;">
      <p><strong>Comprovante de inscrição:</strong><a href="http://localhost:3000/${organizationData.attachment}" target="_blank" style="text-decoration:none"> Clique aqui para visualizar</a></p>
    </div>
  `;
  }
}