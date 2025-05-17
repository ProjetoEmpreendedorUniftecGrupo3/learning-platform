import { IsOptional, IsString } from "class-validator";

export class FindModuleContentsDto {
	@IsString()
	@IsOptional()
	moduleId?: string;
}
