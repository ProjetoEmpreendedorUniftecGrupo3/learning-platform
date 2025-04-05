import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CourseModule } from "@/modules/entities/module.entity";
import { ModuleContent } from "./entities/module-content.entity";
import { ModuleContentController } from "./module-contents.controller";
import { ModuleContentService } from "./module-contents.service";

@Module({
	imports: [TypeOrmModule.forFeature([ModuleContent, CourseModule])],
	controllers: [ModuleContentController],
	providers: [ModuleContentService],
})
export class ModuleContentModule {}
