import { CategoriesModule } from "@/categories/categories.module";
import { ModuleCompletion } from "@/module-completions/entities/module-completion.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseModule } from "./entities/module.entity";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";

@Module({
	imports: [CategoriesModule, TypeOrmModule.forFeature([CourseModule, ModuleCompletion])],
	controllers: [ModulesController],
	providers: [ModulesService],
	exports: [ModulesService],
})
export class ModulesModule {}
