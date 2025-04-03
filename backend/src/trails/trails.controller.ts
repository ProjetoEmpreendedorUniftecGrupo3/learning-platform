import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { User } from "@/users/entities/user.entity";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CreateTrailDto } from "./dto/create-trail.dto";
import { TrailsService } from "./trails.service";

@Controller("trails")
export class TrailsController {
	constructor(private readonly trailsService: TrailsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	create(@Body() createTrailDto: CreateTrailDto) {
		return this.trailsService.create(createTrailDto);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async getTrail(@Param("id") trailId: string, @CurrentUser() user: User) {
		return this.trailsService.getTrailWithProgress(user.id, trailId);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAll() {
		return this.trailsService.findAll();
	}
}
