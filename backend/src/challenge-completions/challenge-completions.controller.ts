import { Body, Controller, Post } from "@nestjs/common";
import { ChallengeCompletionsService } from "./challenge-completions.service";
import { CreateChallengeCompletionDto } from "./dto/create-challenge-completion.dto";

@Controller("challenge-completions")
export class ChallengeCompletionsController {
	constructor(private readonly service: ChallengeCompletionsService) {}

	@Post()
	create(@Body() dto: CreateChallengeCompletionDto) {
		return this.service.create(dto);
	}
}
