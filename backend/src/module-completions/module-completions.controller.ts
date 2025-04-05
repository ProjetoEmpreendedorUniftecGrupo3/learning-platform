import { Controller } from "@nestjs/common";
import { ModuleCompletionsService } from "./module-completions.service";

@Controller("module-completions")
export class ModuleCompletionsController {
	constructor(private readonly service: ModuleCompletionsService) {}
}
