import { Body, Controller, Post } from "@nestjs/common";
import { CreateModuleCompletionDto } from "../dto/create-module-completion.dto";
import { ModuleCompletionsService } from "../services/module-completions.service";

@Controller("module-completions")
export class ModuleCompletionsController {
	constructor(private readonly service: ModuleCompletionsService) {}

	@Post()
	create(@Body() dto: CreateModuleCompletionDto) {
		return this.service.create(dto);
	}
}
