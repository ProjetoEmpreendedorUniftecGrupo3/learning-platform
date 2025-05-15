import { IsOptional, IsUUID } from "class-validator";

export class FindAllModulesDto {
	@IsOptional()
	@IsUUID()
	categoryId?: string;
}
