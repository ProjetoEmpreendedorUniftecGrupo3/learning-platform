import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";

class CategoryOrderItem {
	@IsUUID()
	@IsNotEmpty()
	id: string;

	@IsNotEmpty()
	order: number;
}

export class ReorderCategoriesDto {
	@IsUUID()
	@IsNotEmpty()
	trailId: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CategoryOrderItem)
	categories: CategoryOrderItem[];
}
