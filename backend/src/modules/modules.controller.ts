import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { User, UserRole } from "@/users/entities/user.entity";
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateModuleDto } from "./dto/create-module.dto";
import { FindAllModulesDto } from "./dto/find-all-modules.dto";
import { UpdateModuleCompletionDto } from "./dto/update-module-completion.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
import { ModulesService } from "./modules.service";

@Controller("modules")
export class ModulesController {
	constructor(private readonly modulesService: ModulesService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	create(@Body() createModuleDto: CreateModuleDto) {
		return this.modulesService.create(createModuleDto);
	}

	@Put(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	update(@Param("id") id: string, @Body() updateModuleDto: UpdateModuleDto) {
		return this.modulesService.update(id, updateModuleDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async findAll(@Query() query: FindAllModulesDto) {
		return this.modulesService.findAll(query);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async findOne(@Param("id") id: string) {
		return this.modulesService.findOne(id);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async remove(@Param("id") id: string) {
		return this.modulesService.remove(id);
	}

	@Get(":id/trail-data")
	@UseGuards(JwtAuthGuard)
	async findToUserTrail(@Param("id") id: string, @CurrentUser() user: User) {
		return this.modulesService.findToUserTrail(id, user);
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
