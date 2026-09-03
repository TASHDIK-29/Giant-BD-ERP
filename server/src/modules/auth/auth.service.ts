import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

import { DatabaseService } from '../../database/database.service.js';
import { MailService } from '../mail/mail.service.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';




@Injectable()
export class AuthService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }


    private async generateAccessToken(user: {
        id: number;
        email: string;
        role: string;
    }) {
        const secret = this.configService.getOrThrow<string>(
            'JWT_ACCESS_SECRET',
        );

        const expiresIn = this.configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRES_IN',
        ) as StringValue;

        return this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            {
                secret,
                expiresIn,
            },
        );
    }



    private async generateRefreshToken(user: {
        id: number;
    }) {
        const secret = this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
        );

        const expiresIn = this.configService.getOrThrow<string>(
            'JWT_REFRESH_EXPIRES_IN',
        ) as StringValue;

        return this.jwtService.signAsync(
            {
                sub: user.id,
            },
            {
                secret,
                expiresIn,
            },
        );
    }

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



    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const { email, otp } = verifyOtpDto;

        const user = await this.databaseService.user.findUnique({
            where: {
                email,
            },
        });

        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        const loginOtp = await this.databaseService.loginOtp.findFirst({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!loginOtp) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        if (loginOtp.expiresAt < new Date()) {
            await this.databaseService.loginOtp.delete({
                where: {
                    id: loginOtp.id,
                },
            });

            throw new UnauthorizedException('Invalid or expired OTP');
        }

        const isOtpValid = await bcrypt.compare(
            otp,
            loginOtp.otpHash,
        );

        if (!isOtpValid) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        // OTP can only be used once
        await this.databaseService.loginOtp.delete({
            where: {
                id: loginOtp.id,
            },
        });

        // Generate tokens
        const accessToken = await this.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = await this.generateRefreshToken({
            id: user.id,
        });

        // Hash refresh token before storing it
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        // Calculate refresh token expiration
        const refreshExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        await this.databaseService.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                expiresAt: refreshExpiresAt,
                userId: user.id,
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}