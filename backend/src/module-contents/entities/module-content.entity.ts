import { CourseModule } from "@/modules/entities/module.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum ModuleContentType {
	DOCUMENT = "document",
	VIDEO = "video",
	BLOG = "blog",
	IMAGE = "image",
	WEBSITE = "website",
}

@Entity("module_contents")
export class ModuleContent {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({
		type: "enum",
		enum: ModuleContentType,
	})
	type: ModuleContentType;

	@Column()
	description: string;

	@Column()
	url: string;

	@ManyToOne(() => CourseModule, (courseModule) => courseModule.contents, { onDelete: "CASCADE" })
	courseModule: CourseModule;
}
