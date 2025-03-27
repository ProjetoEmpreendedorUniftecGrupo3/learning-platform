import { ModulesModule } from "@/modules/modules.module";
import { UsersModule } from "@/users/users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ModuleCompletionsController } from "../controllers/module-completions.controller";
import { ModuleCompletion } from "../entities/module-completion.entity";
import { ModuleCompletionsService } from "../services/module-completions.service";

@Module({
	imports: [TypeOrmModule.forFeature([ModuleCompletion]), UsersModule, ModulesModule],
	controllers: [ModuleCompletionsController],
	providers: [ModuleCompletionsService],
})
export class ModuleCompletionModule {}
