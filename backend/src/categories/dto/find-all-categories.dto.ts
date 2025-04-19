import { IsOptional, IsUUID } from "class-validator";

export class FindAllCategoriesDto {
	@IsOptional()
	@IsUUID()
	trailId?: string;
}
