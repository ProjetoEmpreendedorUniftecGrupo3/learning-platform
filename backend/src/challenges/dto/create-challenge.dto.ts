import { IsUUID } from "class-validator";

export class CreateChallengeDto {
	@IsUUID()
	categoryId: string;
}
