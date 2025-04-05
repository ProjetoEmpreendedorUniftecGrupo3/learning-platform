import { ModuleCompletion } from "@/module-completions/entities/module-completion.entity";
import { User } from "@/users/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleCompletionDto } from "./dto/update-mocule-completion.dto";
import { CourseModule } from "./entities/module.entity";

@Injectable()
export class ModulesService {
	constructor(
		@InjectRepository(CourseModule)
		private modulesRepository: Repository<CourseModule>,
		@InjectRepository(ModuleCompletion)
		private readonly moduleCompletionRepository: Repository<ModuleCompletion>,
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
			relations: ["contents"],
		});

		if (!module) {
			throw new NotFoundException(`Module with ID ${id} not found`);
		}

		return module;
	}

	async updateCompletion(
		courseModuleId: string,
		updateDto: UpdateModuleCompletionDto,
		user: User,
	): Promise<CourseModule> {
		const courseModule = await this.modulesRepository.findOne({
			where: { id: courseModuleId },
			relations: ["moduleCompletions", "moduleCompletions.user"],
		});

		if (!courseModule) {
			throw new NotFoundException("Module not found");
		}
		const existing = courseModule.moduleCompletions?.filter((mc) => mc.user.id === user.id);

		if (updateDto.isCompleted) {
			if (!existing.length) {
				const newCompletion = this.moduleCompletionRepository.create({
					user,
					module: courseModule,
				});
				await this.moduleCompletionRepository.save(newCompletion);
			}
		} else {
			if (existing.length) {
				await this.moduleCompletionRepository.remove(existing);
			}
		}

		return this.modulesRepository.findOne({
			where: { id: courseModuleId },
			relations: ["moduleCompletions"],
		});
	}
}
