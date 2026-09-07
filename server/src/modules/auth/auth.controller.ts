import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    Get,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Request, Response } from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
// import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthGuard } from '@nestjs/passport';


import { Public } from '../../common/decorators/public.decorator.js';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }


    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
    ) {
        return this.authService.login(loginDto);
    }



    @Public()
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




    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {


        const accessTokenCookieName =
            this.configService.get<string>(
                'ACCESS_TOKEN_COOKIE_NAME',
            ) ?? 'access_token';

        const refreshTokenCookieName =
            this.configService.get<string>(
                'REFRESH_TOKEN_COOKIE_NAME',
            ) ?? 'refresh_token';


        const refreshToken =
            request.cookies?.[refreshTokenCookieName];

        if (!refreshToken) {
            throw new UnauthorizedException(
                'Refresh token not found',
            );
        }

        const {
            accessToken,
            refreshToken: newRefreshToken,
        } = await this.authService.refresh(refreshToken);

        const isSecure =
            this.configService.get<string>(
                'COOKIE_SECURE',
            ) === 'true';

        const sameSite =
            this.configService.get<
                'lax' | 'strict' | 'none'
            >('COOKIE_SAME_SITE') ?? 'lax';




        response.cookie(accessTokenCookieName, accessToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite,
            maxAge: 15 * 60 * 1000,
            path: '/',
        });


        response.cookie(
            refreshTokenCookieName,
            newRefreshToken,
            {
                httpOnly: true,
                secure: isSecure,
                sameSite,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api/v1/auth',
            },
        );

        return {
            message: 'Token refreshed successfully',
        };
    }



    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const accessTokenCookieName =
            this.configService.get<string>(
                'ACCESS_TOKEN_COOKIE_NAME',
            ) ?? 'access_token';

        const refreshTokenCookieName =
            this.configService.get<string>(
                'REFRESH_TOKEN_COOKIE_NAME',
            ) ?? 'refresh_token';

        const refreshToken =
            request.cookies?.[refreshTokenCookieName];

        // Revoke the token on the server
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        const isSecure =
            this.configService.get<string>(
                'COOKIE_SECURE',
            ) === 'true';

        const sameSite =
            this.configService.get<
                'lax' | 'strict' | 'none'
            >('COOKIE_SAME_SITE') ?? 'lax';

        // Clear the access token cookie
        response.clearCookie(accessTokenCookieName, {
            httpOnly: true,
            secure: isSecure,
            sameSite,
            path: '/',
        });

        // Clear the refresh token cookie
        // IMPORTANT: path must match the original cookie path
        response.clearCookie(refreshTokenCookieName, {
            httpOnly: true,
            secure: isSecure,
            sameSite,
            path: '/api/v1/auth',
        });

        return {
            message: 'Logged out successfully',
        };
    }



    // @Get('session')
    // @UseGuards(AuthGuard('jwt'))
    // getSession(
    //     @CurrentUser() user: {
    //         id: number;
    //         email: string;
    //         name: string;
    //         role: string;
    //     },
    // ) {
    //     return {
    //         user: {
    //             id: user.id,
    //             email: user.email,
    //             name: user.name,
    //             role: user.role,
    //         },
    //         permissions: [],
    //     };
    // }


    @Get('session')
    @UseGuards(AuthGuard('jwt'))
    getSession(
        @CurrentUser()
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
        },
    ) {
        return this.authService.getSession(user.id);
    }
}