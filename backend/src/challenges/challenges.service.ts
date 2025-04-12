import { ChallengeQuestion } from "@/challenge-questions/entities/challenge-question.entity";
import { QuestionAlternative } from "@/challenge-questions/entities/question-alternative.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { ChallengeResponseResultDto } from "./dto/challenge-response-result.dto";
import { ChallengeResponseDto } from "./dto/challenge-response.dto";
import { CreateChallengeDto } from "./dto/create-challenge.dto";
import { Challenge } from "./entities/challenge.entity";

@Injectable()
export class ChallengesService {
	constructor(
		@InjectRepository(Challenge)
		private challengesRepository: Repository<Challenge>,
		@InjectRepository(QuestionAlternative)
		private alternativesRepository: Repository<QuestionAlternative>,
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
			relations: ["questions", "questions.alternatives", "questions.contentModule"],
		});

		if (!challenge) {
			throw new NotFoundException(`Challenge with ID ${id} not found`);
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

	async respond(id: string, { responses }: ChallengeResponseDto): Promise<ChallengeResponseResultDto> {
		const challenge = await this.findOne(id);

		if (responses.length !== challenge.questions.length) {
			throw new BadRequestException("Number of responses does not match number of questions");
		}

		if (
			responses.some((r) => !challenge.questions.some((q) => q.id === r.id)) ||
			challenge.questions.some((q) => !responses.some((r) => q.id === r.id))
		) {
			throw new BadRequestException("Some invalid question id");
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
		const incorrectQuestions: ChallengeQuestion[] = [];

		for (const response of responses) {
			const correctAltId = correctAnswers[response.id];
			if (correctAltId === response.response) {
				correctCount++;
			} else {
				if (questionMap[response.id].contentModule) {
					incorrectQuestions.push(questionMap[response.id]);
				}
			}
		}

		// Calculate percentage
		const percentage = (correctCount / challenge.questions.length) * 100;

		if (percentage >= 70) {
			// TODO: Create challenge completion record
			return {
				success: true,
				message: "Challenge completed successfully!",
				percentage,
			};
		} else {
			return {
				success: false,
				percentage,
				studySuggestions: incorrectQuestions.map((q) => q.contentModule),
			};
		}
	}
}
