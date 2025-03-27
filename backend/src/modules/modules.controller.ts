import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreateModuleDto } from "./dto/create-module.dto";
import { ModulesService } from "./modules.service";

@Controller("modules")
export class ModulesController {
	constructor(private readonly modulesService: ModulesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	create(@Body() createModuleDto: CreateModuleDto) {
		return this.modulesService.create(createModuleDto);
	}
}
