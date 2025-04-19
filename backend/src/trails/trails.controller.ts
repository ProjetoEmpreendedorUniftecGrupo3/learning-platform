import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { User, UserRole } from "@/users/entities/user.entity";
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { CreateTrailDto } from "./dto/create-trail.dto";
import { UpdateTrailDto } from "./dto/update-trail.dto";
import { TrailsService } from "./trails.service";

@Controller("trails")
@UseGuards(JwtAuthGuard)
export class TrailsController {
	constructor(private readonly trailsService: TrailsService) {}

	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserRole.ADMIN)
	create(@Body() createTrailDto: CreateTrailDto) {
		return this.trailsService.create(createTrailDto);
	}

	@Get("progress/:id")
	async getTrail(@Param("id") trailId: string, @CurrentUser() user: User) {
		return this.trailsService.getTrailWithProgress(user.id, trailId);
	}

	@Get()
	async getAll() {
		return this.trailsService.findAll();
	}

	@Put(":id")
	@UseGuards(RolesGuard)
	@Roles(UserRole.ADMIN)
	async update(@Param("id") id: string, @Body() updateTrailDto: UpdateTrailDto) {
		return this.trailsService.update(id, updateTrailDto);
	}

	@Delete(":id")
	@UseGuards(RolesGuard)
	@Roles(UserRole.ADMIN)
	async remove(@Param("id") id: string) {
		return this.trailsService.remove(id);
	}

	@Get(":id")
	@UseGuards(RolesGuard)
	@Roles(UserRole.ADMIN)
	async findOne(@Param("id") id: string) {
		return this.trailsService.findOne(id);
	}
}
