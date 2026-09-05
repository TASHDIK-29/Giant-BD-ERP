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


interface RefreshTokenPayload {
    sub: number;
}


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



    private async verifyRefreshToken(
        refreshToken: string,
    ): Promise<RefreshTokenPayload> {
        const secret = this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
        );

        try {
            return await this.jwtService.verifyAsync<RefreshTokenPayload>(
                refreshToken,
                {
                    secret,
                },
            );
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
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
            include: {
                role: true,
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




    async refresh(refreshToken: string) {
        // 1. Verify the JWT
        const payload =
            await this.verifyRefreshToken(refreshToken);

        // 2. Find the user
        const user = await this.databaseService.user.findUnique({
            where: {
                id: payload.sub,
            },
            include: {
                role: true,
            },
        });

        // 3. Check user exists and is active
        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // 4. Find active refresh tokens for this user
        const storedTokens =
            await this.databaseService.refreshToken.findMany({
                where: {
                    userId: user.id,
                    revokedAt: null,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });

        // 5. Compare provided token with stored hashes
        let matchedToken = null;

        for (const storedToken of storedTokens) {
            const isMatch = await bcrypt.compare(
                refreshToken,
                storedToken.tokenHash,
            );

            if (isMatch) {
                matchedToken = storedToken;
                break;
            }
        }

        // Token is not found in the database
        if (!matchedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        /*
         * 6. Rotate the refresh token.
         *
         * Revoke the old token before creating a new one.
         */
        await this.databaseService.refreshToken.update({
            where: {
                id: matchedToken.id,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        // 7. Generate new access token
        const accessToken = await this.generateAccessToken({
            id: user.id,
            email: user.email,
        });

        // 8. Generate new refresh token
        const newRefreshToken =
            await this.generateRefreshToken({
                id: user.id,
            });

        // 9. Hash the new refresh token
        const refreshTokenHash =
            await bcrypt.hash(newRefreshToken, 10);

        /*
         * Temporary:
         * We will improve the expiration calculation shortly.
         */
        const refreshExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        // 10. Store the new refresh token
        await this.databaseService.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                expiresAt: refreshExpiresAt,
                userId: user.id,
            },
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }



    async logout(refreshToken: string) {
        // Find active refresh tokens
        const storedTokens =
            await this.databaseService.refreshToken.findMany({
                where: {
                    revokedAt: null,
                },
            });

        let matchedToken = null;

        // Compare the provided refresh token with stored hashes
        for (const storedToken of storedTokens) {
            const isMatch = await bcrypt.compare(
                refreshToken,
                storedToken.tokenHash,
            );

            if (isMatch) {
                matchedToken = storedToken;
                break;
            }
        }

        // Revoke the matching token
        if (matchedToken) {
            await this.databaseService.refreshToken.update({
                where: {
                    id: matchedToken.id,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
        }

        return {
            message: 'Logged out successfully',
        };
    }

}