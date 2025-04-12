import { Challenge } from "@/challenges/entities/challenge.entity";
import { CourseModule } from "@/modules/entities/module.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChallengeQuestionsController } from "./challenge-questions.controller";
import { ChallengeQuestionsService } from "./challenge-questions.service";
import { ChallengeQuestion } from "./entities/challenge-question.entity";
import { QuestionAlternative } from "./entities/question-alternative.entity";

@Module({
	imports: [TypeOrmModule.forFeature([ChallengeQuestion, QuestionAlternative, Challenge, CourseModule])],
	controllers: [ChallengeQuestionsController],
	providers: [ChallengeQuestionsService],
	exports: [ChallengeQuestionsService],
})
export class ChallengeQuestionsModule {}
