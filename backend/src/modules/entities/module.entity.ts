import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "../../categories/entities/category.entity";

@Entity()
export class CourseModule {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	title: string;

	@ManyToOne(() => Category, (category) => category.modules)
	category: Category;
}
