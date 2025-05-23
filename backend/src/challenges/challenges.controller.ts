import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { User, UserRole } from "@/users/entities/user.entity";
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ChallengesService } from "./challenges.service";
import { ChallengeResponseDto } from "./dto/challenge-response.dto";
import { CreateChallengeDto } from "./dto/create-challenge.dto";
import { FindAllChallengesDto } from "./dto/find-all-challenges.dto";

@Controller("challenges")
export class ChallengesController {
	constructor(private readonly challengesService: ChallengesService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	create(@Body() createChallengeDto: CreateChallengeDto) {
		return this.challengesService.create(createChallengeDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	findAll(@Query() query: FindAllChallengesDto) {
		return this.challengesService.findAll(query);
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
	@Post(":id/respond")
	@UseGuards(JwtAuthGuard)
	respond(@Param("id") id: string, @Body() data: ChallengeResponseDto, @CurrentUser() user: User) {
		return this.challengesService.respond(id, data, user);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	remove(@Param("id") id: string) {
		return this.challengesService.remove(id);
	}
}
