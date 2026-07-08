import type { UserRole } from '~~/generated/prisma/client';

export interface AuthBody {
    email?: string;
    password?: string;
}

export interface ResetPasswordBody {
    token?: string;
    password?: string;
}

export interface SafeUser {
    id: number;
    email: string;
    role: UserRole;
}

export interface SessionContext {
    id: string;
    expiresAt: Date;
}

declare module 'h3' {
    interface H3EventContext {
        user?: SafeUser;
        session?: SessionContext;
    }
}
