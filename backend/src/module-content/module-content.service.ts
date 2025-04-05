import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CourseModule } from "@/modules/entities/module.entity";
import { CreateModuleContentDto } from "./dto/create-module-content.dto";
import { ModuleContent } from "./entities/module-content.entity";

@Injectable()
export class ModuleContentService {
	constructor(
		@InjectRepository(ModuleContent)
		private readonly moduleContentRepository: Repository<ModuleContent>,
		@InjectRepository(CourseModule)
		private readonly courseModuleRepository: Repository<CourseModule>,
	) {}

	async create(data: CreateModuleContentDto): Promise<ModuleContent> {
		const courseModule = await this.courseModuleRepository.findOne({
			where: { id: data.moduleId },
		});

		if (!courseModule) {
			throw new NotFoundException("CourseModule not found");
		}

		const content = this.moduleContentRepository.create({
			...data,
			courseModule,
		});

		return this.moduleContentRepository.save(content);
	}
}
