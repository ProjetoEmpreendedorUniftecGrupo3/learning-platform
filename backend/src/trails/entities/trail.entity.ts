import { Category } from "@/categories/entities/category.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Trail {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@OneToMany(() => Category, (category) => category.trail)
	categories: Category[];
}
