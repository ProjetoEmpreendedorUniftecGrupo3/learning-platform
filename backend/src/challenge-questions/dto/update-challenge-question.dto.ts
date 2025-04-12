import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

export class UpdateQuestionAlternativeDto {
	@IsString()
	@IsNotEmpty()
	text: string;

	@IsBoolean()
	@IsNotEmpty()
	isCorrect: boolean;
}

export class UpdateChallengeQuestionDto {
	@IsString()
	@IsOptional()
	question?: string;

	@IsUUID()
	@IsOptional()
	contentModuleId?: string;

	@IsUUID()
	@IsOptional()
	challengeId?: string;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => UpdateQuestionAlternativeDto)
	alternatives?: UpdateQuestionAlternativeDto[];
}
