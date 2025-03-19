import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

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
	password: string;

	@IsDate()
	@Type(() => Date)
	birthDate: Date;
}
