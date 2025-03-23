import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class PasswordResetDto {
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	@Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])/, {
		message: "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais",
	})
	newPassword: string;
}
