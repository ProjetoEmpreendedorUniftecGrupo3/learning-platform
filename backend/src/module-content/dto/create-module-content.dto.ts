import { IsEnum, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { ModuleContentType } from "../entities/module-content.entity";

export class CreateModuleContentDto {
	@IsEnum(ModuleContentType)
	type: ModuleContentType;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsUrl()
	url: string;

	@IsString()
	@IsNotEmpty()
	moduleId: string;
}
