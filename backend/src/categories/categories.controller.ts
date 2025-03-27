import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Controller("categories")
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto);
	}
}
