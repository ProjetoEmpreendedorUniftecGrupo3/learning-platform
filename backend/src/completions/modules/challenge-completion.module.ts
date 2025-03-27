import { ChallengesModule } from "@/challenges/challenges.module";
import { UsersModule } from "@/users/users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChallengeCompletionsController } from "../controllers/challenge-completions.controller";
import { ChallengeCompletion } from "../entities/challenge-completion.entity";
import { ChallengeCompletionsService } from "../services/challenge-completions.service";

@Module({
	imports: [TypeOrmModule.forFeature([ChallengeCompletion]), UsersModule, ChallengesModule],
	controllers: [ChallengeCompletionsController],
	providers: [ChallengeCompletionsService],
})
export class ChallengeCompletionModule {}
