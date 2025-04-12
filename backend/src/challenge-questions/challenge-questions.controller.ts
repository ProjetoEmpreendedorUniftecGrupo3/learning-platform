import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ChallengeQuestionsService } from "./challenge-questions.service";
import { CreateChallengeQuestionDto } from "./dto/create-challenge-question.dto";
import { UpdateChallengeQuestionDto } from "./dto/update-challenge-question.dto";

@Controller("challenge-questions")
export class ChallengeQuestionsController {
	constructor(private readonly questionsService: ChallengeQuestionsService) {}

	@Post()
	create(@Body() createQuestionDto: CreateChallengeQuestionDto) {
		return this.questionsService.create(createQuestionDto);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.questionsService.findOne(id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateQuestionDto: UpdateChallengeQuestionDto) {
		return this.questionsService.update(id, updateQuestionDto);
	}
}
