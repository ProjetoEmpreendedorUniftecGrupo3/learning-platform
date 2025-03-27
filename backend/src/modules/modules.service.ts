import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { CreateModuleDto } from "./dto/create-module.dto";
import { CourseModule } from "./entities/module.entity";

@Injectable()
export class ModulesService {
	constructor(
		@InjectRepository(CourseModule)
		private modulesRepository: Repository<CourseModule>,
		private categoriesService: CategoriesService,
	) {}

	async create(createModuleDto: CreateModuleDto): Promise<CourseModule> {
		const category = await this.categoriesService.findOne(createModuleDto.categoryId);
		const module = this.modulesRepository.create({
			title: createModuleDto.title,
			category,
		});
		return this.modulesRepository.save(module);
	}

	async findOne(id: string): Promise<CourseModule> {
		const module = await this.modulesRepository.findOne({
			where: { id },
		});

		if (!module) {
			throw new NotFoundException(`Module with ID ${id} not found`);
		}

		return module;
	}
}
