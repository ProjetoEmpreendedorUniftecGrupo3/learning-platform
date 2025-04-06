import { IsBoolean } from "class-validator";

export class UpdateModuleCompletionDto {
	@IsBoolean()
	isCompleted: boolean;
}
