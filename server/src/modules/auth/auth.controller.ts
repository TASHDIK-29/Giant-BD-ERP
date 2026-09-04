import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Response } from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
    ) {
        return this.authService.login(loginDto);
    }


    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(
        @Body() verifyOtpDto: VerifyOtpDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { accessToken, refreshToken } =
            await this.authService.verifyOtp(verifyOtpDto);


        const isSecure =
            this.configService.get<string>('COOKIE_SECURE') === 'true';

        const sameSite = this.configService.get<
            'lax' | 'strict' | 'none'
        >('COOKIE_SAME_SITE') ?? 'lax';

        const accessTokenCookieName =
            this.configService.get<string>(
                'ACCESS_TOKEN_COOKIE_NAME',
            ) ?? 'access_token';

        const refreshTokenCookieName =
            this.configService.get<string>(
                'REFRESH_TOKEN_COOKIE_NAME',
            ) ?? 'refresh_token';

        response.cookie(accessTokenCookieName, accessToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: sameSite,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        response.cookie(refreshTokenCookieName, refreshToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: sameSite,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
            message: 'Login successful',
        };
    }
}