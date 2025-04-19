import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";

import { ChallengeCompletion } from "@/challenge-completions/entities/challenge-completion.entity";
import { ModuleCompletion } from "@/module-completions/entities/module-completion.entity";
import { CreateTrailDto } from "./dto/create-trail.dto";
import { TrailResponseDto } from "./dto/trail-response.dto";
import { UpdateTrailDto } from "./dto/update-trail.dto";
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

	async create(createTrailDto: CreateTrailDto) {
		const sameNameTrail = await this.trailsRepository.exists({ where: { name: createTrailDto.name.trim() } });
		if (sameNameTrail) {
			throw new ConflictException("Já existe uma trilha com o mesmo nome");
		}
		const trail = this.trailsRepository.create({ name: createTrailDto.name.trim() });
		return this.trailsRepository.save(trail);
	}

	async findOne(id: string): Promise<Trail> {
		const trail = await this.trailsRepository.findOne({
			where: { id },
			relations: {
				categories: {
					modules: true,
					challenge: true,
				},
			},
		});

		if (!trail) {
			throw new NotFoundException(`Trilha com ID ${id} não encontrada`);
		}

		return trail;
	}

	async findAll(): Promise<Trail[]> {
		return this.trailsRepository.find({
			relations: {
				categories: true,
			},
			order: {
				name: "ASC",
			},
		});
	}

	async update(id: string, updateTrailDto: UpdateTrailDto): Promise<Trail> {
		const trail = await this.findOne(id);

		if (updateTrailDto.name) {
			const sameNameTrail = await this.trailsRepository.exists({
				where: {
					name: updateTrailDto.name.trim(),
					id: Not(id),
				},
			});

			if (sameNameTrail) {
				throw new ConflictException("Já existe uma trilha com o mesmo nome");
			}

			trail.name = updateTrailDto.name.trim();
		}

		return this.trailsRepository.save(trail);
	}

	async remove(id: string): Promise<void> {
		const trail = await this.findOne(id);
		await this.trailsRepository.remove(trail);
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

		if (!trail) {
			throw new NotFoundException(`Trilha com ID ${trailId} não encontrada`);
		}

		let hasIncompletedChallenge = false;
		const categoriesWithProgress = [];

		for (const category of trail.categories) {
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

			const blocked = hasIncompletedChallenge;

			categoriesWithProgress.push({
				...category,
				modules: modulesWithStatus,
				challenge: challengeStatus,
				blocked,
			});

			if (challengeStatus && !challengeStatus.completed) {
				hasIncompletedChallenge = true;
			}
		}

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
