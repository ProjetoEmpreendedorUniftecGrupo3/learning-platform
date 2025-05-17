import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import { ModuleContentType } from "../entities/module-content.entity";

export class UpdateModuleContentDto {
	@IsEnum(ModuleContentType)
	@IsOptional()
	type?: ModuleContentType;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	description?: string;

	@IsUrl()
	@IsOptional()
	url?: string;
}
