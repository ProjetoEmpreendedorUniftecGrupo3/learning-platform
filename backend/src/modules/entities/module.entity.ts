import { ModuleContent } from "@/module-contents/entities/module-content.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "../../categories/entities/category.entity";

@Entity()
export class CourseModule {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	title: string;

	@ManyToOne(() => Category, (category) => category.modules)
	category: Category;
	@OneToMany(() => ModuleContent, (moduleContent) => moduleContent.courseModule)
	contents: ModuleContent[];
}
