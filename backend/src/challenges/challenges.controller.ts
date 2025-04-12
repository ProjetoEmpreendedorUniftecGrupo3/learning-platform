import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { UserRole } from "@/users/entities/user.entity";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ChallengesService } from "./challenges.service";
import { ChallengeResponseDto } from "./dto/challenge-response.dto";
import { CreateChallengeDto } from "./dto/create-challenge.dto";

@Controller("challenges")
export class ChallengesController {
	constructor(private readonly challengesService: ChallengesService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	create(@Body() createChallengeDto: CreateChallengeDto) {
		return this.challengesService.create(createChallengeDto);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	findOne(@Param("id") id: string) {
		return this.challengesService.findOne(id);
	}

	@Get(":id/respond")
	@UseGuards(JwtAuthGuard)
	findToRespond(@Param("id") id: string) {
		return this.challengesService.findToRespond(id);
	}

	@Get(":id/respond")
	@UseGuards(JwtAuthGuard)
	@Post(":id/respond")
	respond(@Param("id") id: string, @Body() data: ChallengeResponseDto) {
		return this.challengesService.respond(id, data);
	}
}
