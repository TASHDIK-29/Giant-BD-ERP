import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendLoginOtp(email: string, otp: string): Promise<void> {
    // Temporary implementation for development
    this.logger.log(`OTP for ${email}: ${otp}`);

    /*
    Later, we will replace this with actual email sending.
    */
  }
}