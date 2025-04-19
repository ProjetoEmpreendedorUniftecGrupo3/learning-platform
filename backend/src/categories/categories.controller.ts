import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { UserRole } from "@/users/entities/user.entity";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { FindAllCategoriesDto } from "./dto/find-all-categories.dto";
import { ReorderCategoriesDto } from "./dto/reorder-categories.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Post()
	@Roles(UserRole.ADMIN)
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto);
	}

	@Get()
	@Roles(UserRole.ADMIN)
	findAll(@Query() query: FindAllCategoriesDto) {
		return this.categoriesService.findAll(query);
	}

	@Get(":id")
	@Roles(UserRole.ADMIN)
	findOne(@Param("id") id: string) {
		return this.categoriesService.findOne(id);
	}

	@Put(":id")
	@Roles(UserRole.ADMIN)
	update(@Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
		return this.categoriesService.update(id, updateCategoryDto);
	}

	@Delete(":id")
	@Roles(UserRole.ADMIN)
	remove(@Param("id") id: string) {
		return this.categoriesService.remove(id);
	}

	@Post("reorder")
	@Roles(UserRole.ADMIN)
	reorder(@Body() reorderDto: ReorderCategoriesDto) {
		return this.categoriesService.reorder(reorderDto);
	}
}
