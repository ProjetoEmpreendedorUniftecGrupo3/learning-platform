import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TrailsService } from "../trails/trails.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { ReorderCategoriesDto } from "./dto/reorder-categories.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
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

		if (!trail) {
			throw new NotFoundException(`Trilha com ID ${createCategoryDto.trailId} não encontrada`);
		}

		const order =
			(await this.categoriesRepository.count({
				where: { trail: { id: trail.id } },
			})) + 1;

		const category = this.categoriesRepository.create({
			...createCategoryDto,
			order,
			trail,
		});
		return this.categoriesRepository.save(category);
	}

	async findAll(query?: { trailId?: string }): Promise<Category[]> {
		const where = query?.trailId ? { trail: { id: query.trailId } } : {};
		return this.categoriesRepository.find({
			where,
			relations: ["trail", "modules", "challenge"],
			order: {
				order: "ASC",
			},
		});
	}

	async findOne(id: string): Promise<Category> {
		const category = await this.categoriesRepository.findOne({
			where: { id },
			relations: ["trail", "modules", "challenge"],
		});

		if (!category) {
			throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
		}

		return category;
	}

	async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
		const category = await this.findOne(id);
		let originalTrailId;

		const trail = await this.trailsService.findOne(updateCategoryDto.trailId);
		if (!trail) {
			throw new NotFoundException(`Trilha com ID ${updateCategoryDto.trailId} não encontrada`);
		}
		if (updateCategoryDto.trailId !== category.trail.id) {
			originalTrailId = category.trail.id;
			category.trail = trail;
			category.order =
				(await this.categoriesRepository.count({
					where: { trail: { id: trail.id } },
				})) + 1;
		}

		Object.assign(category, updateCategoryDto);

		const response = await this.categoriesRepository.save(category);

		if (originalTrailId) {
			const originalTrailCategories = await this.findAll({ trailId: originalTrailId });
			await this.reorder({
				trailId: originalTrailId,
				categories: originalTrailCategories.map((category, index) => ({ id: category.id, order: index + 1 })),
			});
		}

		return response;
	}

	async remove(id: string): Promise<void> {
		const category = await this.findOne(id);
		await this.categoriesRepository.remove(category);

		const trailCategories = await this.findAll({ trailId: category.trail.id });
		await this.reorder({
			trailId: category.trail.id,
			categories: trailCategories.map((category, index) => ({ id: category.id, order: index + 1 })),
		});
	}

	async reorder(reorderDto: ReorderCategoriesDto): Promise<Category[]> {
		const trail = await this.trailsService.findOne(reorderDto.trailId);
		if (!trail) {
			throw new NotFoundException(`Trilha com ID ${reorderDto.trailId} não encontrada`);
		}

		// Get all categories for this trail
		const existingCategories = await this.findAll({ trailId: reorderDto.trailId });

		// Validate that we have the same number of categories
		if (existingCategories.length !== reorderDto.categories.length) {
			throw new BadRequestException(
				`O número de categorias fornecido (${reorderDto.categories.length}) não corresponde ao número de categorias na trilha (${existingCategories.length})`,
			);
		}

		// Validate that all categories exist and belong to this trail
		const categoryMap = new Map(existingCategories.map((cat) => [cat.id, cat]));
		for (const item of reorderDto.categories) {
			const category = categoryMap.get(item.id);
			if (!category) {
				throw new NotFoundException(`Categoria com ID ${item.id} não encontrada`);
			}
			if (category.trail.id !== reorderDto.trailId) {
				throw new BadRequestException(`Categoria com ID ${item.id} não pertence à trilha especificada`);
			}
		}

		// Update the order of all categories
		const updatePromises = reorderDto.categories.map((item) => {
			const category = categoryMap.get(item.id);
			category.order = item.order;
			return this.categoriesRepository.save(category);
		});

		const updatedCategories = await Promise.all(updatePromises);
		return updatedCategories;
	}
}
