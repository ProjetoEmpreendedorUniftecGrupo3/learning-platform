import { IsEmail } from "class-validator";

export class PasswordRecoverDto {
	@IsEmail()
	email: string;
}
