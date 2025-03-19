import { Body, ConflictException, Controller, Post } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response-dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post("register")
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
}
