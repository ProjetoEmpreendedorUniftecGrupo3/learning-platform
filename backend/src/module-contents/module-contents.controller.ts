import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { UserRole } from "@/users/entities/user.entity";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateModuleContentDto } from "./dto/create-module-content.dto";
import { FindModuleContentsDto } from "./dto/find-module-contents.dto";
import { UpdateModuleContentDto } from "./dto/update-module-content.dto";
import { ModuleContent } from "./entities/module-content.entity";
import { ModuleContentService } from "./module-contents.service";

@Controller("module-contents")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModuleContentController {
	constructor(private readonly moduleContentService: ModuleContentService) {}

	@Post()
	@Roles(UserRole.ADMIN)
	async create(@Body() data: CreateModuleContentDto): Promise<ModuleContent> {
		return this.moduleContentService.create(data);
	}

	@Get()
	@Roles(UserRole.ADMIN)
	async findAll(@Query() query: FindModuleContentsDto): Promise<ModuleContent[]> {
		return this.moduleContentService.findAll(query);
	}

	@Get(":id")
	@Roles(UserRole.ADMIN)
	async findOne(@Param("id") id: string): Promise<ModuleContent> {
		return this.moduleContentService.findOne(id);
	}

	@Put(":id")
	@Roles(UserRole.ADMIN)
	async update(@Param("id") id: string, @Body() updateDto: UpdateModuleContentDto): Promise<ModuleContent> {
		return this.moduleContentService.update(id, updateDto);
	}

	@Delete(":id")
	@Roles(UserRole.ADMIN)
	async remove(@Param("id") id: string): Promise<void> {
		return this.moduleContentService.remove(id);
	}
}
