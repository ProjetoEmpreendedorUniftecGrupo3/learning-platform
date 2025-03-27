import { Category } from "@/categories/entities/category.entity";
import { Challenge } from "@/challenges/entities/challenge.entity";
import { ChallengeCompletion } from "@/completions/entities/challenge-completion.entity";
import { ModuleCompletion } from "@/completions/entities/module-completion.entity";
import { CourseModule } from "@/modules/entities/module.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Trail } from "./entities/trail.entity";
import { TrailsController } from "./trails.controller";
import { TrailsService } from "./trails.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Trail, Category, CourseModule, Challenge, ModuleCompletion, ChallengeCompletion]),
	],
	controllers: [TrailsController],
	providers: [TrailsService],
	exports: [TrailsService],
})
export class TrailsModule {}
