import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TrailsService } from "../trails/trails.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Category } from "./entities/category.entity";

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private categoriesRepository: Repository<Category>,
		private trailsService: TrailsService,
	) {}

	async create(createCategoryDto: CreateCategoryDto) {
		const trail = await this.trailsService.findOne(createCategoryDto.trailId);
		const category = this.categoriesRepository.create({
			...createCategoryDto,
			trail,
		});
		return this.categoriesRepository.save(category);
	}

	async findOne(id: string): Promise<Category> {
		const category = await this.categoriesRepository.findOne({
			where: { id },
		});

		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}

		return category;
	}
}
