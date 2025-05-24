import { Trail } from "@/trails/entities/trail.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Challenge } from "@/challenges/entities/challenge.entity";
import { CourseModule } from "@/modules/entities/module.entity";

@Entity()
export class Category {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => Trail, (trail) => trail.categories, { onDelete: "CASCADE" })
	trail: Trail;

	@Column()
	name: string;

	@Column()
	order: number;

	@OneToMany(() => CourseModule, (module) => module.category, {
		cascade: true,
	})
	modules: CourseModule[];

	@OneToOne(() => Challenge, (challenge) => challenge.category, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn()
	challenge: Challenge;
}
