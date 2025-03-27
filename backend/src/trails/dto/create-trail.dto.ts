import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateTrailDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;
}
