import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ChallengeCompletion } from "@/completions/entities/challenge-completion.entity";
import { ModuleCompletion } from "@/completions/entities/module-completion.entity";
import { CreateTrailDto } from "./dto/create-trail.dto";
import { TrailResponseDto } from "./dto/trail-response.dto";
import { Trail } from "./entities/trail.entity";

@Injectable()
export class TrailsService {
	constructor(
		@InjectRepository(Trail)
		private trailsRepository: Repository<Trail>,
		@InjectRepository(ModuleCompletion)
		private moduleCompletionsRepository: Repository<ModuleCompletion>,
		@InjectRepository(ChallengeCompletion)
		private challengeCompletionsRepository: Repository<ChallengeCompletion>,
	) {}

	create(createTrailDto: CreateTrailDto) {
		const trail = this.trailsRepository.create(createTrailDto);
		return this.trailsRepository.save(trail);
	}

	async findOne(id: string): Promise<Trail> {
		const trail = await this.trailsRepository.findOne({
			where: { id },
		});

		if (!trail) {
			throw new NotFoundException(`Trail with ID ${id} not found`);
		}

		return trail;
	}

	async getTrailWithProgress(userId: string, trailId: string): Promise<TrailResponseDto> {
		const trail = await this.trailsRepository.findOne({
			where: { id: trailId },
			relations: {
				categories: {
					modules: true,
					challenge: true,
				},
			},
			order: {
				categories: {
					order: "ASC",
				},
			},
		});

		const categoriesWithProgress = await Promise.all(
			trail.categories.map(async (category, index) => {
				const modulesWithStatus = await Promise.all(
					category.modules.map(async (module) => ({
						...module,
						completed: await this.isModuleCompleted(userId, module.id),
					})),
				);

				const challengeStatus = category.challenge
					? {
							id: category.challenge.id,
							completed: await this.isChallengeCompleted(userId, category.challenge.id),
						}
					: null;

				const previousCategory = trail.categories[index - 1];
				const blocked =
					index > 0 && previousCategory?.challenge
						? !(await this.isChallengeCompleted(userId, previousCategory.challenge.id))
						: false;

				return {
					...category,
					modules: modulesWithStatus,
					challenge: challengeStatus,
					blocked,
				};
			}),
		);

		return {
			trail: {
				id: trail.id,
				name: trail.name,
				categories: categoriesWithProgress,
			},
		};
	}

	private async isModuleCompleted(userId: string, moduleId: string): Promise<boolean> {
		return this.moduleCompletionsRepository.exists({
			where: {
				user: { id: userId },
				module: { id: moduleId },
			},
		});
	}

	private async isChallengeCompleted(userId: string, challengeId: string): Promise<boolean> {
		return this.challengeCompletionsRepository.exists({
			where: {
				user: { id: userId },
				challenge: { id: challengeId },
			},
		});
	}
}
