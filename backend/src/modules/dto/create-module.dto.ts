import { IsString, IsUUID } from "class-validator";

export class CreateModuleDto {
	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsUUID()
	categoryId: string;
}
