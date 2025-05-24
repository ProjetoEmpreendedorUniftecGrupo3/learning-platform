import { IsOptional, IsUUID } from "class-validator";

export class FindAllChallengesDto {
	@IsOptional()
	@IsUUID()
	trailId?: string;
}
