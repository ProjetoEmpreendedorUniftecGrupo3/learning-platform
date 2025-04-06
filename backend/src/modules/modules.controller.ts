import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { User } from "@/users/entities/user.entity";
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleCompletionDto } from "./dto/update-module-completion.dto";
import { ModulesService } from "./modules.service";

@Controller("modules")
export class ModulesController {
	constructor(private readonly modulesService: ModulesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	create(@Body() createModuleDto: CreateModuleDto) {
		return this.modulesService.create(createModuleDto);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async findOne(@Param("id") id: string, @CurrentUser() user: User) {
		return this.modulesService.findOne(id, user);
	}

	@Patch(":id/completion")
	@UseGuards(JwtAuthGuard)
	async updateModuleCompletion(
		@Param("id") id: string,
		@Body() updateModuleCompletionDto: UpdateModuleCompletionDto,
		@CurrentUser() user: User,
	) {
		return this.modulesService.updateCompletion(id, updateModuleCompletionDto, user);
	}
}
