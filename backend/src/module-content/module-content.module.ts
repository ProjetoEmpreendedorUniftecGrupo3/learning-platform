import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CourseModule } from "@/modules/entities/module.entity";
import { ModuleContent } from "./entities/module-content.entity";
import { ModuleContentController } from "./module-content.controller";
import { ModuleContentService } from "./module-content.service";

@Module({
	imports: [TypeOrmModule.forFeature([ModuleContent, CourseModule])],
	controllers: [ModuleContentController],
	providers: [ModuleContentService],
})
export class ModuleContentModule {}
