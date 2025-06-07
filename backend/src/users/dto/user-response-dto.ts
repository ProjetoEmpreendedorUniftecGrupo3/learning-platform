import { Expose } from "class-transformer";
import { User, UserRole } from "../entities/user.entity";

export class UserResponseDto {
	@Expose()
	id: string;

	@Expose()
	email: string;

	@Expose()
	fullName: string;

	@Expose()
	birthDate: Date;

	@Expose()
	createdAt: Date;

	@Expose()
	role: UserRole;

	constructor(partial: Partial<User>) {
		Object.assign(this, partial);
	}
}
