import { Category } from "@/categories/entities/category.entity";
import { Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Challenge {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@OneToOne(() => Category, (category) => category.challenge)
	category: Category;
}
