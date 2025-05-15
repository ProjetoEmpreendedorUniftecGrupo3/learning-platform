import { Challenge } from "@/challenges/entities/challenge.entity";
import { CourseModule } from "@/modules/entities/module.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuestionAlternative } from "./question-alternative.entity";

@Entity()
export class ChallengeQuestion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	question: string;

	@ManyToOne(() => CourseModule, { nullable: true, onDelete: "CASCADE" })
	courseModule?: CourseModule;

	@ManyToOne(() => Challenge, (challenge) => challenge.questions, { onDelete: "CASCADE" })
	challenge: Challenge;

	@OneToMany(() => QuestionAlternative, (alternative) => alternative.question, {
		cascade: true,
	})
	alternatives: QuestionAlternative[];
}
