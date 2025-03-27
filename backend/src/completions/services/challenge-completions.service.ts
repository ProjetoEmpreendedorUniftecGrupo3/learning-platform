import { ChallengesService } from "@/challenges/challenges.service";
import { UsersService } from "@/users/users.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateChallengeCompletionDto } from "../dto/create-challenge-completion.dto";
import { ChallengeCompletion } from "../entities/challenge-completion.entity";

@Injectable()
export class ChallengeCompletionsService {
	constructor(
		@InjectRepository(ChallengeCompletion)
		private completionRepository: Repository<ChallengeCompletion>,
		private usersService: UsersService,
		private challengesService: ChallengesService,
	) {}

	async create(dto: CreateChallengeCompletionDto): Promise<ChallengeCompletion> {
		const user = await this.usersService.findById(dto.userId);
		const challenge = await this.challengesService.findOne(dto.challengeId);

		const completion = this.completionRepository.create({
			user,
			challenge,
			completedAt: dto.completedAt,
		});

		return this.completionRepository.save(completion);
	}
}
