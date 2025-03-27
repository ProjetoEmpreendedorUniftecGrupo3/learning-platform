import { IsDate, IsUUID } from "class-validator";

export class CreateModuleCompletionDto {
	@IsUUID()
	userId: string;

	@IsUUID()
	moduleId: string;

	@IsDate()
	completedAt: Date;
}
