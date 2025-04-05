import { ModuleCompletion } from "@/module-completions/entities/module-completion.entity";
import * as bcrypt from "bcrypt";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
	USER = "user",
	ADMIN = "admin",
}

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	fullName: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ type: "date" })
	birthDate: Date;

	@Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@OneToMany(() => ModuleCompletion, (moduleCompletion) => moduleCompletion.user)
	moduleCompletions: ModuleCompletion[];

	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}
}
