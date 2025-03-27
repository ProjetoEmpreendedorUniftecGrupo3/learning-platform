import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { CreateChallengeDto } from "./dto/create-challenge.dto";
import { Challenge } from "./entities/challenge.entity";

@Injectable()
export class ChallengesService {
	constructor(
		@InjectRepository(Challenge)
		private challengesRepository: Repository<Challenge>,
		private categoriesService: CategoriesService,
	) {}

	async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
		const category = await this.categoriesService.findOne(createChallengeDto.categoryId);
		const challenge = this.challengesRepository.create({ category });
		return this.challengesRepository.save(challenge);
	}

	async findOne(id: string): Promise<Challenge> {
		const challenge = await this.challengesRepository.findOne({
			where: { id },
		});

		if (!challenge) {
			throw new NotFoundException(`Challenge with ID ${id} not found`);
		}

		return challenge;
	}
}
