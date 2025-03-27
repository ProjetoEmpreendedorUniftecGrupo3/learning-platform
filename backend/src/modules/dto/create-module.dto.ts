import { IsString, IsUUID } from "class-validator";

export class CreateModuleDto {
	@IsString()
	title: string;

	@IsUUID()
	categoryId: string;
}
