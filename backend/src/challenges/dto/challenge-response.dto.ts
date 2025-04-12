import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";

export class ChallengeResponseDataDto {
	@IsNotEmpty()
	@IsUUID()
	id: string;

	@IsNotEmpty()
	@IsUUID()
	response: string;
}

export class ChallengeResponseDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ChallengeResponseDataDto)
	responses: ChallengeResponseDataDto[];
}
