import { Challenge } from "@/challenges/entities/challenge.entity";
import { CourseModule } from "@/modules/entities/module.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateChallengeQuestionDto } from "./dto/create-challenge-question.dto";
import { UpdateChallengeQuestionDto } from "./dto/update-challenge-question.dto";
import { ChallengeQuestion } from "./entities/challenge-question.entity";

@Injectable()
export class ChallengeQuestionsService {
	constructor(
		@InjectRepository(ChallengeQuestion)
		private readonly questionRepository: Repository<ChallengeQuestion>,
		@InjectRepository(Challenge)
		private readonly challengeRepository: Repository<Challenge>,
		@InjectRepository(CourseModule)
		private readonly moduleRepository: Repository<CourseModule>,
	) {}

	async create(createQuestionDto: CreateChallengeQuestionDto) {
		const challenge = await this.challengeRepository.findOne({
			where: { id: createQuestionDto.challengeId },
			relations: ["category"],
		});
		if (!challenge) {
			throw new NotFoundException(`Desafio com ID ${createQuestionDto.challengeId} não encontrado`);
		}

		let courseModule: CourseModule | undefined = undefined;
		if (createQuestionDto.moduleId) {
			courseModule = await this.moduleRepository.findOne({
				where: { id: createQuestionDto.moduleId },
				relations: ["category"],
			});
			if (!courseModule) {
				throw new NotFoundException(`Módulo com ID ${createQuestionDto.moduleId} não encontrado`);
			}

			if (courseModule.category.id !== challenge.category.id) {
				throw new BadRequestException("O módulo deve ser da mesma categoria do desafio");
			}
		}

		const correctQuestionsLength = createQuestionDto.alternatives.filter((q) => q.isCorrect).length;
		if (correctQuestionsLength > 1) {
			throw new BadRequestException("A questão deve ter apenas uma alternativa correta");
		}

		const question = this.questionRepository.create({
			...createQuestionDto,
			challenge,
			courseModule,
		});

		return this.questionRepository.save(question);
	}

	async findOne(id: string) {
		const question = await this.questionRepository.findOne({
			where: { id },
			relations: ["alternatives", "courseModule", "challenge"],
		});

		if (!question) {
			throw new NotFoundException(`Questão com ID ${id} não encontrada`);
		}

		return question;
	}

	async update(id: string, updateQuestionDto: UpdateChallengeQuestionDto) {
		const question = await this.findOne(id);

		// Atualizar desafio se fornecido
		if (updateQuestionDto.challengeId) {
			const challenge = await this.challengeRepository.findOne({
				where: { id: updateQuestionDto.challengeId },
				relations: ["category"],
			});
			if (!challenge) {
				throw new NotFoundException(`Desafio com ID ${updateQuestionDto.challengeId} não encontrado`);
			}

			// Se o desafio mudou e existe um courseModule, verificar consistência
			if (question.courseModule) {
				// Buscar categoria do courseModule atual apenas se necessário
				const currentModule = await this.moduleRepository.findOne({
					where: { id: question.courseModule.id },
					relations: ["category"],
				});

				if (currentModule && challenge.category.id !== currentModule.category.id) {
					question.courseModule = null; // Definir como null se categorias forem diferentes
				}
			}

			question.challenge = challenge;
		}

		// Atualizar módulo se fornecido
		if (updateQuestionDto.moduleId !== undefined) {
			if (updateQuestionDto.moduleId === null) {
				question.courseModule = null;
			} else {
				const courseModule = await this.moduleRepository.findOne({
					where: { id: updateQuestionDto.moduleId },
					relations: ["category"],
				});
				if (!courseModule) {
					throw new NotFoundException(`Módulo com ID ${updateQuestionDto.moduleId} não encontrado`);
				}

				// Buscar categoria do challenge atual apenas se necessário
				let challengeCategory;
				if (updateQuestionDto.challengeId) {
					// Se o challenge foi alterado nesta requisição, já temos a categoria
					challengeCategory = question.challenge.category;
				} else {
					// Se o challenge não foi alterado, buscar a categoria
					const currentChallenge = await this.challengeRepository.findOne({
						where: { id: question.challenge.id },
						relations: ["category"],
					});
					challengeCategory = currentChallenge?.category;
				}

				// Validar se módulo e desafio são da mesma categoria
				if (challengeCategory && courseModule.category.id !== challengeCategory.id) {
					throw new BadRequestException("O módulo deve ser da mesma categoria do desafio");
				}

				question.courseModule = courseModule;
			}
		}

		if (updateQuestionDto.alternatives) {
			const correctQuestionsLength = updateQuestionDto.alternatives.filter((q) => q.isCorrect).length;
			if (correctQuestionsLength > 1) {
				throw new BadRequestException("A questão deve ter apenas uma alternativa correta");
			}
		}

		Object.assign(question, updateQuestionDto);
		return this.questionRepository.save(question);
	}

	async remove(id: string): Promise<void> {
		const question = await this.findOne(id);
		await this.questionRepository.remove(question);
	}
}
