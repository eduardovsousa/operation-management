import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninDto } from './dto/signin';
import { UserRepository } from 'src/shared/database/repositories/users.repositories';
import { OrganizationRepository } from 'src/shared/database/repositories/organizations.repositories';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup';
import * as fs from 'fs';
import * as path from 'path';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Resend } from 'resend';
import { ResetPasswordDto } from './dto/resetPassword';
import { NewPasswordDto } from './dto/newPassword';
import { env } from 'src/shared/config/env';

const resend = new Resend(env.resendToken);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersRepo: UserRepository,
    private readonly organizationRepo: OrganizationRepository,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) { }

  async getCompanyInfoByCnpj(cnpj: string): Promise<any> {
    const url = `https://www.receitaws.com.br/v1/cnpj/${cnpj}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error) => {
            this.logger.error(error.response.data);
            throw 'Um erro aconteceu ao tentar buscar o CNPJ, tente novamente mais tarde!';
          }),
        ),
      );

      return data;
    } catch (error) {
      throw 'Ocorreu um erro ao buscar os dados';
    }
  }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;

    const user = await this.usersRepo.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  async signup(signupDto: SignupDto, attachmentFiles: Express.Multer.File[]) {
    if (!this.isPDF(attachmentFiles[0])) {
      throw new ConflictException('O arquivo deve ser um PDF.');
    }

    const MAX_SIZE = 1 * 1024 * 1024;
    if (attachmentFiles[0].size > MAX_SIZE) {
      throw new ConflictException(
        `O tamanho do attachment (Comprovante de Inscrição) deve ser igual ou menor que 1MB`,
      );
    }

    const {
      firstName,
      lastName,
      email,
      rg,
      birthdate,
      phone,
      password,
      confirmPassword,
      organizationName,
      cnpj,
    } = signupDto;

    signupDto.role = 'user';

    const emailTaken = await this.usersRepo.findUnique({
      where: { email },
      select: { id: true },
    });

    const rgTaken = await this.usersRepo.findUnique({
      where: { rg },
      select: { id: true },
    });

    const organizationNameTaken = await this.organizationRepo.findUnique({
      where: { organizationName },
      select: { id: true },
    });

    const cnpjTaken = await this.organizationRepo.findUnique({
      where: { cnpj },
      select: { id: true },
    });

    if (emailTaken) {
      throw new ConflictException('Este e-mail já está cadastrado!');
    }

    if (rgTaken) {
      throw new ConflictException('Este RG já está cadastrado!');
    }

    if (organizationNameTaken) {
      throw new ConflictException('Esta organization já está cadastrada!');
    }

    if (cnpjTaken) {
      throw new ConflictException('Esta organization já está cadastrada!');
    }

    if (password !== confirmPassword) {
      throw new ConflictException("As senhas devem ser iguais!");
    }

    const hashedPassword = await hash(password, 12);

    const user = await this.usersRepo.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        rg: rg,
        birthdate: birthdate,
        phone: phone,
        password: hashedPassword,
        role: signupDto.role,
      },
      include: {
        organizations: true,
      },
    });

    try {
      const imagePath = await this.uploadImage(
        user.id,
        'Documentacao',
        attachmentFiles[0],
      );


      await this.organizationRepo.create({
        data: {
          userId: user.id,
          organizationName: organizationName,
          cnpj: cnpj,
          attachment: imagePath,
          registered: false,
        },
      });
    } catch (error) {
      throw new Error(error);
    }

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  async sendMail({ recipient_email, otpCode }) {
    try {
      const findUserByEmail = await this.usersRepo.findUnique({
        where: { email: recipient_email },
      });

      if (findUserByEmail) {
        await this.usersRepo.update({
          where: { email: recipient_email },
          data: { otpCode },
        });

        await resend.emails.send({
          from: 'Código de Verificação <onboarding@resend.dev>',
          to: recipient_email,
          subject: 'Reset de senha',
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
                                                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Código de verificação</h1>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Segue o código de verificação para seguir com o processo de alteração de senha.<br/>Insira o código abaixo no navegador para continuar:</p>
            <span style="background:#1f3566;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;"> &nbsp; &nbsp;${otpCode} &nbsp; &nbsp;</span>
                                                  
                                                  <p style="color:#455056; font-size:15px;line-height:24px; margin-top:35px;font-style: italic;">Caso você não tenha solicitado, basta ignorar.</p>
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
            </html>`,
        });

      } else {
        throw new NotFoundException("Usuário não encontrado");
      }
    } catch (error) {
      throw new BadRequestException("Erro ao enviar e-mail");
    }
  }

  async verifyOTP(resetPassword: ResetPasswordDto): Promise<void> {
    const { recipient_email, otpCode } = resetPassword;

    const user = await this.usersRepo.findUnique({ where: { email: recipient_email } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.otpCode !== otpCode) {
      throw new UnauthorizedException('Código incorreto. Verifique o código em seu e-mail');
    }

    await this.usersRepo.update({
      where: { email: recipient_email },
      data: { otpCode: null },
    });
  }

  async updatePass(newPassword: NewPasswordDto) {
    const email = newPassword.recipient_email;

    const newPass = newPassword.password;

    const hashedPassword = await hash(newPass, 12);

    if (newPassword.password !== newPassword.confirmPassword) {
      throw new ConflictException("As senhas devem ser iguais!");
    }

    try {
      await this.usersRepo.update({
        where: { email: email },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  private async uploadImage(
    userId: string,
    organizationId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const randomNumber = generateRandomNumber();
    const uniqueFilename = `${Date.now()}-${randomNumber}${file.originalname}`;
    const userFolderPath = path.join('uploads', userId, organizationId);
    const uploadPath = path.join(userFolderPath, uniqueFilename);

    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    return new Promise<string>((resolve, reject) => {
      fs.writeFile(uploadPath, file.buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          const imagePath = `${userId}/${organizationId}/${uniqueFilename}`;
          resolve(imagePath);
        }
      });
    });
  }

  private isPDF(file: Express.Multer.File): boolean {
    const allowedExtensions = ['.pdf'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    return allowedExtensions.includes(fileExtension);
  }

  private generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId });
  }
}

function generateRandomNumber(): number {
  return (
    Math.floor(Math.random() * (9999999999999 - 1000000000000 + 1)) + 10000
  );
}
