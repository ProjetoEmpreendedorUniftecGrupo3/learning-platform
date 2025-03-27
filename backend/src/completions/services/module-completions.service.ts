import { ModulesService } from "@/modules/modules.service";
import { UsersService } from "@/users/users.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateModuleCompletionDto } from "../dto/create-module-completion.dto";
import { ModuleCompletion } from "../entities/module-completion.entity";

@Injectable()
export class ModuleCompletionsService {
	constructor(
		@InjectRepository(ModuleCompletion)
		private completionRepository: Repository<ModuleCompletion>,
		private usersService: UsersService,
		private modulesService: ModulesService,
	) {}

	async create(dto: CreateModuleCompletionDto): Promise<ModuleCompletion> {
		const user = await this.usersService.findById(dto.userId);
		const module = await this.modulesService.findOne(dto.moduleId);

		const completion = this.completionRepository.create({
			user,
			module,
			completedAt: dto.completedAt,
		});

		return this.completionRepository.save(completion);
	}
}
