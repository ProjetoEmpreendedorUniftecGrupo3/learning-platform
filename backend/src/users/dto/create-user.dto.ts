import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(100)
	fullName: string;

	@IsEmail()
	@MaxLength(255)
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(32)
	@Matches(/(?=.*\d)/, {
		message: "A senha deve conter pelo menos um número",
	})
	@Matches(/(?=.*[a-z])/, {
		message: "A senha deve conter pelo menos uma letra minúscula",
	})
	@Matches(/(?=.*[A-Z])/, {
		message: "A senha deve conter pelo menos uma letra maiúscula",
	})
	@Matches(/(?=.*[\W_])/, {
		message: "A senha deve conter pelo menos um caractere especial",
	})
	password: string;

	@IsDate()
	@Type(() => Date)
	birthDate: Date;
}
