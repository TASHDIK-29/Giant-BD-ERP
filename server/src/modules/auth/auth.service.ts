import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

import { DatabaseService } from '../../database/database.service.js';
import { MailService } from '../mail/mail.service.js';
import { LoginDto } from './dto/login.dto.js';




@Injectable()
export class AuthService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.databaseService.user.findUnique({
            where: {
                email,
            },
        });



        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }


        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('You are not allowed to login.');
        }


        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        // Generate cryptographically secure 6-digit OTP
        const otp = randomInt(100000, 1000000).toString();

        // Hash OTP before storing it
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP expires in 1 minute
        const expiresAt = new Date(
            Date.now() + 60 * 1000,
        );


        // Remove previous OTPs
        await this.databaseService.loginOtp.deleteMany({
            where: {
                userId: user.id,
            },
        });

        

        // Create OTP record
        await this.databaseService.loginOtp.create({
            data: {
                otpHash,
                expiresAt,
                userId: user.id,
            },
        });

        // Send OTP
        await this.mailService.sendLoginOtp(
            user.email,
            otp,
        );

        return {
            message: 'OTP sent successfully',
        };
    }
}