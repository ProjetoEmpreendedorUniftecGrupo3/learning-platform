import { CourseModule } from "@/modules/entities/module.entity";

export class ChallengeResponseResultDto {
	success: boolean;
	percentage: number;
	message?: string;
	studySuggestions?: CourseModule[];
}
