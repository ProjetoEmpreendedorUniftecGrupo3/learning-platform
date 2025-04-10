import { ModuleCompletion } from "@/module-completions/entities/module-completion.entity";
import { User } from "@/users/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleCompletionDto } from "./dto/update-module-completion.dto";
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
			description: createModuleDto.description,
			category,
		});
		return this.modulesRepository.save(module);
	}

	async findOne(
		id: string,
		user: User,
	): Promise<Pick<CourseModule, "id" | "title" | "description" | "contents"> & { completed: boolean }> {
		const courseModule = await this.modulesRepository
			.createQueryBuilder("module")
			.leftJoinAndSelect("module.moduleCompletions", "completion", "completion.userId = :userId", {
				userId: user.id,
			})
			.leftJoinAndSelect("module.contents", "contents")
			.where("module.id = :id", { id })
			.getOne();

		if (!courseModule) {
			throw new NotFoundException(`Module with ID ${id} not found`);
		}
		return {
			id: courseModule.id,
			title: courseModule.title,
			description: courseModule.description,
			contents: courseModule.contents,
			completed: courseModule.moduleCompletions.length > 0,
		};
	}

	async updateCompletion(courseModuleId: string, updateDto: UpdateModuleCompletionDto, user: User) {
		const courseModule = await this.modulesRepository
			.createQueryBuilder("module")
			.leftJoinAndSelect("module.moduleCompletions", "completion", "completion.userId = :userId", {
				userId: user.id,
			})
			.leftJoinAndSelect("completion.user", "user")
			.where("module.id = :courseModuleId", { courseModuleId })
			.getOne();

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

		return await this.findOne(courseModuleId, user);
	}
}
