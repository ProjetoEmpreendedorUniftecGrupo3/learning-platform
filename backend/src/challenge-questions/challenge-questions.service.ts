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
			throw new NotFoundException(`Challenge with ID ${createQuestionDto.challengeId} not found`);
		}

		let contentModule: CourseModule | undefined = undefined;
		if (createQuestionDto.contentModuleId) {
			contentModule = await this.moduleRepository.findOne({
				where: { id: createQuestionDto.contentModuleId },
				relations: ["category"],
			});
			if (!contentModule) {
				throw new NotFoundException(`Course module with ID ${createQuestionDto.contentModuleId} not found`);
			}

			if (contentModule.category.id !== challenge.category.id) {
				throw new BadRequestException("O conteúdo deve ser da mesma categoria do desafio");
			}
		}

		const correctQuestionsLength = createQuestionDto.alternatives.filter((q) => q.isCorrect).length;
		if (correctQuestionsLength > 1) {
			throw new BadRequestException("A questão deve ter apenas uma alternativa correta");
		}

		const question = this.questionRepository.create({
			...createQuestionDto,
			challenge,
			contentModule,
		});

		return this.questionRepository.save(question);
	}

	async findOne(id: string) {
		const question = await this.questionRepository.findOne({
			where: { id },
			relations: ["alternatives", "contentModule"],
		});

		if (!question) {
			throw new NotFoundException(`Question with ID ${id} not found`);
		}

		return question;
	}

	async update(id: string, updateQuestionDto: UpdateChallengeQuestionDto) {
		const question = await this.findOne(id);

		if (updateQuestionDto.challengeId) {
			const challenge = await this.challengeRepository.findOne({
				where: { id: updateQuestionDto.challengeId },
			});
			if (!challenge) {
				throw new NotFoundException(`Challenge with ID ${updateQuestionDto.challengeId} not found`);
			}
			question.challenge = challenge;
		}

		if (updateQuestionDto.contentModuleId) {
			const contentModule = await this.moduleRepository.findOne({
				where: { id: updateQuestionDto.contentModuleId },
			});
			if (!contentModule) {
				throw new NotFoundException(`Course module with ID ${updateQuestionDto.contentModuleId} not found`);
			}
			question.contentModule = contentModule;
		}

		Object.assign(question, updateQuestionDto);
		return this.questionRepository.save(question);
	}
}
