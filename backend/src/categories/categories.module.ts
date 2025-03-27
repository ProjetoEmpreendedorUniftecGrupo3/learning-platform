import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TrailsModule } from "@/trails/trails.module";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { Category } from "./entities/category.entity";

@Module({
	imports: [TrailsModule, TypeOrmModule.forFeature([Category])],
	controllers: [CategoriesController],
	providers: [CategoriesService],
	exports: [CategoriesService],
})
export class CategoriesModule {}
