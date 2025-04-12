import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../users/entities/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<UserRole[]>("roles", context.getHandler());

		if (!requiredRoles) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			throw new UnauthorizedException("User not authenticated");
		}

		if (!requiredRoles.includes(user.role)) {
			throw new ForbiddenException("Access denied. Insufficient permissions");
		}

		return true;
	}
}
