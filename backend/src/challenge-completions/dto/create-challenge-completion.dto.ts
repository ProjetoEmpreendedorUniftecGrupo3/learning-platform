import { IsDate, IsUUID } from "class-validator";

export class CreateChallengeCompletionDto {
	@IsUUID()
	userId: string;

	@IsUUID()
	challengeId: string;

	@IsDate()
	completedAt: Date;
}
