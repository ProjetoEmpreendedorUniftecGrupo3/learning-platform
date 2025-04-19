import { Category } from "@/categories/entities/category.entity";
import { ChallengeQuestion } from "@/challenge-questions/entities/challenge-question.entity";
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Challenge {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@OneToOne(() => Category, (category) => category.challenge)
	category: Category;

	@OneToMany(() => ChallengeQuestion, (question) => question.challenge, {
		cascade: true,
	})
	questions: ChallengeQuestion[];
}
