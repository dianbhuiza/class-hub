import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    me(req: Request): {
        user: {
            id: string;
            email: string;
        };
    };
}
