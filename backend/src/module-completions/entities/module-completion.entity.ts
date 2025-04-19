import { CourseModule } from "@/modules/entities/module.entity";
import { User } from "@/users/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ModuleCompletion {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user: User;

	@ManyToOne(() => CourseModule, { onDelete: "CASCADE" })
	module: CourseModule;

	@CreateDateColumn()
	completedAt: Date;
}
