import { Body, Controller, Post } from "@nestjs/common";
import { CreateChallengeCompletionDto } from "../dto/create-challenge-completion.dto";
import { ChallengeCompletionsService } from "../services/challenge-completions.service";

@Controller("challenge-completions")
export class ChallengeCompletionsController {
	constructor(private readonly service: ChallengeCompletionsService) {}

	@Post()
	create(@Body() dto: CreateChallengeCompletionDto) {
		return this.service.create(dto);
	}
}
