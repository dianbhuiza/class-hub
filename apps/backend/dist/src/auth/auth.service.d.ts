import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    private setTokenCookie;
    register(dto: RegisterDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
        };
        access_token: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
        };
        access_token: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    private generateToken;
}
