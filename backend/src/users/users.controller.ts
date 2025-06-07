import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { Roles } from "@/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Body, ConflictException, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { plainToInstance } from "class-transformer";
import { CreateUserDto } from "./dto/create-user.dto";
import { FindAllUsersDto } from "./dto/find-all-users.dto";
import { PaginatedUsersResponseDto } from "./dto/paginated-users-response.dto";
import { UserResponseDto } from "./dto/user-response-dto";
import { User, UserRole } from "./entities/user.entity";
import { UsersService } from "./users.service";
const oneSecond = 1000;
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post("register")
	@Throttle({ default: { limit: 15, ttl: 60 * oneSecond } })
	async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
		const existingUser = await this.usersService.findByEmail(createUserDto.email);

		if (existingUser) {
			throw new ConflictException("Email já cadastrado");
		}

		const user = await this.usersService.create(createUserDto);
		return plainToInstance(UserResponseDto, user, {
			excludeExtraneousValues: true,
		});
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	async findAll(@Query() query: FindAllUsersDto): Promise<PaginatedUsersResponseDto> {
		const result = await this.usersService.findAll(query);

		const usersDto = plainToInstance(UserResponseDto, result.users, {
			excludeExtraneousValues: true,
		});

		return new PaginatedUsersResponseDto(usersDto, result.total, result.page, result.limit);
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
		const currentUser = await this.usersService.findById(user.id);
		return plainToInstance(UserResponseDto, currentUser, {
			excludeExtraneousValues: true,
		});
	}
}
