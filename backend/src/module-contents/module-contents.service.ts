import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CourseModule } from "@/modules/entities/module.entity";
import { CreateModuleContentDto } from "./dto/create-module-content.dto";
import { FindModuleContentsDto } from "./dto/find-module-contents.dto";
import { UpdateModuleContentDto } from "./dto/update-module-content.dto";
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

	async findAll(query?: FindModuleContentsDto): Promise<ModuleContent[]> {
		const where = query?.moduleId ? { courseModule: { id: query.moduleId } } : {};

		return this.moduleContentRepository.find({
			where,
			relations: {
				courseModule: true,
			},
			order: {
				description: "ASC",
			},
		});
	}

	async findOne(id: string): Promise<ModuleContent> {
		const content = await this.moduleContentRepository.findOne({
			where: { id },
			relations: {
				courseModule: true,
			},
		});

		if (!content) {
			throw new NotFoundException(`Conteúdo com ID ${id} não encontrado`);
		}

		return content;
	}

	async update(id: string, updateDto: UpdateModuleContentDto): Promise<ModuleContent> {
		const content = await this.findOne(id);

		if (updateDto.type) {
			content.type = updateDto.type;
		}

		if (updateDto.description) {
			content.description = updateDto.description;
		}

		if (updateDto.url) {
			content.url = updateDto.url;
		}

		await this.moduleContentRepository.save(content);
		return this.findOne(content.id);
	}

	async remove(id: string): Promise<void> {
		const content = await this.findOne(id);
		await this.moduleContentRepository.remove(content);
	}
}
