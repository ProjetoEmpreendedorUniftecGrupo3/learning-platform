import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ChallengesService } from "./challenges.service";
import { CreateChallengeDto } from "./dto/create-challenge.dto";

@Controller("challenges")
export class ChallengesController {
	constructor(private readonly challengesService: ChallengesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	create(@Body() createChallengeDto: CreateChallengeDto) {
		return this.challengesService.create(createChallengeDto);
	}
}
