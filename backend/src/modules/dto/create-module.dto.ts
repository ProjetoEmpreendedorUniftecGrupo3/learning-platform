import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateModuleDto {
	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsUUID()
	categoryId: string;
}
