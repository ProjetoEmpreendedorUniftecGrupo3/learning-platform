import { UserRole } from "../../users/entities/user.entity";

export interface JwtPayload {
	sub: string; // ID do usuário (subject)
	email: string;
	role: UserRole;
	iat?: number; // issued at (timestamp)
	exp?: number; // expiration (timestamp)
}
