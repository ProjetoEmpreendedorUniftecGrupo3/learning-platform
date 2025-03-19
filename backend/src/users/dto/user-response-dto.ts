import { Expose } from "class-transformer";
import { User } from "../entities/user.entity";

export class UserResponseDto {
	@Expose()
	id: string;

	@Expose()
	email: string;

	@Expose()
	fullName: string;

	@Expose()
	birthDate: Date;

	constructor(partial: Partial<User>) {
		Object.assign(this, partial);
	}
}
