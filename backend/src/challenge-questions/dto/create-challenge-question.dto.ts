import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

export class CreateQuestionAlternativeDto {
	@IsString()
	@IsNotEmpty()
	text: string;

	@IsBoolean()
	@IsNotEmpty()
	isCorrect: boolean;
}

export class CreateChallengeQuestionDto {
	@IsString()
	@IsNotEmpty()
	question: string;

	@IsUUID()
	@IsOptional()
	contentModuleId?: string;

	@IsUUID()
	@IsNotEmpty()
	challengeId: string;

	@IsArray()
	@IsNotEmpty()
	@Type(() => CreateQuestionAlternativeDto)
	@ValidateNested({ each: true })
	alternatives: CreateQuestionAlternativeDto[];
}
