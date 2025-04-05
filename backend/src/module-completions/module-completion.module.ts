import { ModulesModule } from "@/modules/modules.module";
import { UsersModule } from "@/users/users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ModuleCompletion } from "./entities/module-completion.entity";
import { ModuleCompletionsController } from "./module-completions.controller";
import { ModuleCompletionsService } from "./module-completions.service";

@Module({
	imports: [TypeOrmModule.forFeature([ModuleCompletion]), UsersModule, ModulesModule],
	controllers: [ModuleCompletionsController],
	providers: [ModuleCompletionsService],
})
export class ModuleCompletionModule {}
