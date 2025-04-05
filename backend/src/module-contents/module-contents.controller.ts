import { Body, Controller, Post } from "@nestjs/common";
import { CreateModuleContentDto } from "./dto/create-module-content.dto";
import { ModuleContent } from "./entities/module-content.entity";
import { ModuleContentService } from "./module-contents.service";

@Controller("module-contents")
export class ModuleContentController {
	constructor(private readonly moduleContentService: ModuleContentService) {}

	@Post()
	async create(@Body() data: CreateModuleContentDto): Promise<ModuleContent> {
		return this.moduleContentService.create(data);
	}
}
