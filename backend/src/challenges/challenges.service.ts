import { ChallengeCompletion } from "@/challenge-completions/entities/challenge-completion.entity";
import { ChallengeQuestion } from "@/challenge-questions/entities/challenge-question.entity";
import { User } from "@/users/entities/user.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { ChallengeResponseResultDto } from "./dto/challenge-response-result.dto";
import { ChallengeResponseDto } from "./dto/challenge-response.dto";
import { CreateChallengeDto } from "./dto/create-challenge.dto";
import { FindAllChallengesDto } from "./dto/find-all-challenges.dto";
import { Challenge } from "./entities/challenge.entity";

@Injectable()
export class ChallengesService {
	constructor(
		@InjectRepository(Challenge)
		private challengesRepository: Repository<Challenge>,
		@InjectRepository(ChallengeCompletion)
		private readonly chalengeCompletionRepository: Repository<ChallengeCompletion>,
		private categoriesService: CategoriesService,
	) {}

	async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
		const category = await this.categoriesService.findOne(createChallengeDto.categoryId);
		if (category.challenge) {
			throw new BadRequestException("Categoria já possui um desafio");
		}
		const challenge = this.challengesRepository.create({ category });
		return this.challengesRepository.save(challenge);
	}

	async findAll(query?: FindAllChallengesDto): Promise<Challenge[]> {
		const where = query?.trailId ? { category: { trail: { id: query.trailId } } } : {};
		return this.challengesRepository.find({
			where,
			relations: ["category", "category.trail", "questions"],
		});
	}

	async findOne(id: string): Promise<Challenge> {
		const challenge = await this.challengesRepository.findOne({
			where: { id },
			relations: ["questions", "questions.alternatives", "questions.courseModule", "category"],
		});

		if (!challenge) {
			throw new NotFoundException(`Desafio com ID ${id} não encontrado`);
		}

		return challenge;
	}

	async findToRespond(id: string): Promise<{
		id: Challenge["id"];
		questions: {
			id: string;
			question: string;
			alternatives: {
				id: string;
				text: string;
			}[];
		}[];
	}> {
		const challenge = await this.findOne(id);

		const questions = challenge.questions.map((question) => {
			return {
				id: question.id,
				question: question.question,
				alternatives: question.alternatives.map(({ isCorrect, ...alt }) => ({ id: alt.id, text: alt.text })),
			};
		});

		return { id: challenge.id, questions };
	}

	async respond(id: string, { responses }: ChallengeResponseDto, user: User): Promise<ChallengeResponseResultDto> {
		const challenge = await this.findOne(id);

		if (responses.length !== challenge.questions.length) {
			throw new BadRequestException("O número de respostas não corresponde ao número de questões");
		}

		if (
			responses.some((r) => !challenge.questions.some((q) => q.id === r.id)) ||
			challenge.questions.some((q) => !responses.some((r) => q.id === r.id))
		) {
			throw new BadRequestException("Algum ID de questão é inválido");
		}

		// Create an object to store correct answers
		const correctAnswers = {};
		const questionMap: { [key: string]: ChallengeQuestion } = {};
		for (const question of challenge.questions) {
			const correctAlt = question.alternatives.find((alt) => alt.isCorrect);
			if (correctAlt) {
				correctAnswers[question.id] = correctAlt.id;
				questionMap[question.id] = question;
			}
		}

		// Count correct answers and track incorrect ones
		let correctCount = 0;
		const studySuggestions: ChallengeQuestion["courseModule"][] = [];

		for (const response of responses) {
			const correctAltId = correctAnswers[response.id];
			if (correctAltId === response.response) {
				correctCount++;
			} else {
				if (
					questionMap[response.id].courseModule &&
					!studySuggestions.some(
						(studySuggestion) => studySuggestion.id === questionMap[response.id].courseModule.id,
					)
				) {
					studySuggestions.push(questionMap[response.id].courseModule);
				}
			}
		}

		// Calculate percentage
		const percentage = (correctCount / challenge.questions.length) * 100;

		if (percentage >= 70) {
			const newCompletion = this.chalengeCompletionRepository.create({
				user,
				challenge: challenge,
			});
			await this.chalengeCompletionRepository.save(newCompletion);
			return {
				success: true,
				message: "Desafio concluído com sucesso!",
				percentage,
			};
		} else {
			return {
				success: false,
				percentage,
				studySuggestions,
			};
		}
	}

	async remove(id: string): Promise<void> {
		const challenge = await this.findOne(id);
		await this.challengesRepository.remove(challenge);
	}
}
