import { Challenge } from "@/challenges/entities/challenge.entity";
import { User } from "@/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChallengeCompletion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => User)
	user: User;

	@ManyToOne(() => Challenge)
	challenge: Challenge;

	@Column({ type: "timestamp" })
	completedAt: Date;
}
