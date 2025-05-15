import { ModuleCompletion } from "@/module-completions/entities/module-completion.entity";
import { User } from "@/users/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoriesService } from "../categories/categories.service";
import { CreateModuleDto } from "./dto/create-module.dto";
import { FindAllModulesDto } from "./dto/find-all-modules.dto";
import { UpdateModuleCompletionDto } from "./dto/update-module-completion.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
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

		if (!category) {
			throw new NotFoundException(`Categoria com ID ${createModuleDto.categoryId} não encontrada`);
		}

		const module = this.modulesRepository.create({
			title: createModuleDto.title,
			description: createModuleDto.description,
			category,
		});
		return this.modulesRepository.save(module);
	}

	async update(id: string, updateModuleDto: UpdateModuleDto): Promise<CourseModule> {
		const courseModule = await this.modulesRepository.findOne({ where: { id } });

		if (!courseModule) {
			throw new NotFoundException(`Módulo com ID ${id} não encontrado`);
		}

		if (updateModuleDto.title) {
			courseModule.title = updateModuleDto.title;
		}

		if (updateModuleDto.description) {
			courseModule.description = updateModuleDto.description;
		}

		if (updateModuleDto.categoryId) {
			const category = await this.categoriesService.findOne(updateModuleDto.categoryId);

			if (!category) {
				throw new NotFoundException(`Categoria com ID ${updateModuleDto.categoryId} não encontrada`);
			}

			courseModule.category = category;
		}

		const updatedModule = await this.modulesRepository.save(courseModule);

		return this.findOne(updatedModule.id);
	}

	async findToUserTrail(
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
			throw new NotFoundException(`Módulo com ID ${id} não encontrado`);
		}
		return {
			id: courseModule.id,
			title: courseModule.title,
			description: courseModule.description,
			contents: courseModule.contents,
			completed: courseModule.moduleCompletions.length > 0,
		};
	}

	async findOne(id: string): Promise<CourseModule> {
		const courseModule = await this.modulesRepository.findOne({
			where: { id },
			relations: {
				category: true,
				contents: true,
			},
		});

		if (!courseModule) {
			throw new NotFoundException(`Módulo com ID ${id} não encontrado`);
		}

		return courseModule;
	}

	async findAll(query?: FindAllModulesDto): Promise<CourseModule[]> {
		const where = query?.categoryId ? { category: { id: query.categoryId } } : {};
		return this.modulesRepository.find({
			where,
			relations: {
				category: true,
			},
			order: {
				title: "ASC",
			},
		});
	}

	async remove(id: string): Promise<void> {
		const courseModule = await this.findOne(id);
		await this.modulesRepository.remove(courseModule);
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
			throw new NotFoundException("Módulo não encontrado");
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

		return await this.findToUserTrail(courseModuleId, user);
	}
}
