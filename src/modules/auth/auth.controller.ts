import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin';
import { SignupDto } from './dto/signup';
import { IsPublic } from 'src/shared/decorators/IsPublic';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ResetPasswordDto } from './dto/resetPassword';
import { NewPasswordDto } from './dto/newPassword';

@IsPublic()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signin')
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('verifyCnpj')
  async verifyCnpj(@Body() { cnpj }: { cnpj: string }) {
    try {
      const cnpjInfo = await this.authService.getCompanyInfoByCnpj(cnpj);
      const nome = cnpjInfo?.nome || null;
      return { nome };
    } catch (error) {
      return { error: error.message || 'Erro ao buscar dados da API.' };
    }
  }

  @Post('signup')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'attachment', maxCount: 1 },
  ]))
  signup(
    @Body() signupUserDto: SignupDto,
    @UploadedFiles() files: { attachment?: Express.Multer.File[] },
  ) {
    return this.authService.signup(signupUserDto, files.attachment);
  }


  @Post('send_recovery_email')
  async requestOtp(@Body() body: { recipient_email: string }, @Res() res): Promise<any> {
    try {
      const otp = this.generateOtp();

      await this.authService.sendMail({ recipient_email: body.recipient_email, otpCode: otp });
      return res.status(HttpStatus.OK).json({ message: 'OTP enviado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  @Post('verify_otp')
  async verifyOTP(@Body() resetPassword: ResetPasswordDto) {
    return this.authService.verifyOTP(resetPassword);
  }

  @Post('change_pass')
  async updatePass(@Body() newPassword: NewPasswordDto) {
    return this.authService.updatePass(newPassword);
  }

  private generateOtp(): number {
    return Math.floor(Math.random() * 9000 + 1000);
  }
}
