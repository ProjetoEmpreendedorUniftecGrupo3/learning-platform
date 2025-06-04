import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { UserRole } from "@/users/entities/user.entity";
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ChallengeQuestionsService } from "./challenge-questions.service";
import { CreateChallengeQuestionDto } from "./dto/create-challenge-question.dto";
import { UpdateChallengeQuestionDto } from "./dto/update-challenge-question.dto";

@Controller("challenge-questions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChallengeQuestionsController {
	constructor(private readonly questionsService: ChallengeQuestionsService) {}

	@Post()
	@Roles(UserRole.ADMIN)
	create(@Body() createQuestionDto: CreateChallengeQuestionDto) {
		return this.questionsService.create(createQuestionDto);
	}

	@Get(":id")
	@Roles(UserRole.ADMIN)
	findOne(@Param("id") id: string) {
		return this.questionsService.findOne(id);
	}

	@Put(":id")
	@Roles(UserRole.ADMIN)
	update(@Param("id") id: string, @Body() updateQuestionDto: UpdateChallengeQuestionDto) {
		return this.questionsService.update(id, updateQuestionDto);
	}

	@Delete(":id")
	@Roles(UserRole.ADMIN)
	remove(@Param("id") id: string) {
		return this.questionsService.remove(id);
	}
}
