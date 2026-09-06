import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
    ExtractJwt,
    Strategy,
} from 'passport-jwt';


import { DatabaseService } from '../../../database/database.service.js';


interface AccessTokenPayload {
    sub: number;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
    ) {
        const accessTokenCookieName =
            configService.get<string>(
                'ACCESS_TOKEN_COOKIE_NAME',
            ) ?? 'access_token';

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) =>
                    request?.cookies?.[accessTokenCookieName] ?? null,
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>(
                'JWT_ACCESS_SECRET',
            ),
        });
    }


    // async validate(payload: AccessTokenPayload) {
    //     const user = await this.databaseService.user.findUnique({
    //         where: {
    //             id: payload.sub,
    //         },
    //         select: {
    //             id: true,
    //             email: true,
    //             name: true,
    //             role: true,
    //             status: true,
    //         },
    //     });

    //     if (!user || user.status !== 'ACTIVE') {
    //         throw new UnauthorizedException(
    //             'Unauthorized',
    //         );
    //     }

    //     return {
    //         id: user.id,
    //         email: user.email,
    //         name: user.name,
    //         role: user.role.name,
    //     };
    // }


    async validate(payload: AccessTokenPayload) {
        const user =
            await this.databaseService.user.findUnique({
                where: {
                    id: payload.sub,
                },

                select: {
                    id: true,
                    email: true,
                    name: true,
                    status: true,
                    roleId: true,

                    role: {
                        select: {
                            name: true,
                            status: true,
                        },
                    },
                },
            });

        if (
            !user ||
            user.status !== 'ACTIVE' ||
            !user.role ||
            user.role.status !== 'ACTIVE'
        ) {
            throw new UnauthorizedException(
                'Unauthorized',
            );
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            role: user.role.name,
        };
    }
}