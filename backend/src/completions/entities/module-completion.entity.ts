import { CourseModule } from "@/modules/entities/module.entity";
import { User } from "@/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ModuleCompletion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => User)
	user: User;

	@ManyToOne(() => CourseModule)
	module: CourseModule;

	@Column({ type: "timestamp" })
	completedAt: Date;
}
