import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateModuleDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsUUID()
	categoryId?: string;
}
