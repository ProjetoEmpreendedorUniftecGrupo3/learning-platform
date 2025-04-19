import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChallengeQuestion } from "./challenge-question.entity";

@Entity()
export class QuestionAlternative {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	text: string;

	@Column()
	isCorrect: boolean;

	@ManyToOne(() => ChallengeQuestion, (question) => question.alternatives, { onDelete: "CASCADE" })
	question: ChallengeQuestion;
}
