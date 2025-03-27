import { IsInt, IsString, IsUUID } from "class-validator";

export class CreateCategoryDto {
	@IsString()
	name: string;

	@IsInt()
	order: number;

	@IsUUID()
	trailId: string;
}
