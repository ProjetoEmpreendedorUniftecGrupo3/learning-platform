import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CategoriesModule } from "@/categories/categories.module";
import { QuestionAlternative } from "@/challenge-questions/entities/question-alternative.entity";
import { ChallengesController } from "./challenges.controller";
import { ChallengesService } from "./challenges.service";
import { Challenge } from "./entities/challenge.entity";

@Module({
	imports: [CategoriesModule, TypeOrmModule.forFeature([Challenge, QuestionAlternative])],
	controllers: [ChallengesController],
	providers: [ChallengesService],
	exports: [ChallengesService],
})
export class ChallengesModule {}
