import { ChallengesModule } from "@/challenges/challenges.module";
import { UsersModule } from "@/users/users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChallengeCompletionsController } from "./challenge-completions.controller";
import { ChallengeCompletionsService } from "./challenge-completions.service";
import { ChallengeCompletion } from "./entities/challenge-completion.entity";

@Module({
	imports: [TypeOrmModule.forFeature([ChallengeCompletion]), UsersModule, ChallengesModule],
	controllers: [ChallengeCompletionsController],
	providers: [ChallengeCompletionsService],
})
export class ChallengeCompletionModule {}
