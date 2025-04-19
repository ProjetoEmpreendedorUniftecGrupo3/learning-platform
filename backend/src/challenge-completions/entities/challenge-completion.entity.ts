import { Challenge } from "@/challenges/entities/challenge.entity";
import { User } from "@/users/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChallengeCompletion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user: User;

	@ManyToOne(() => Challenge, { onDelete: "CASCADE" })
	challenge: Challenge;

	@CreateDateColumn()
	completedAt: Date;
}
