import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
const oneSecond = 1000;
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}
	@Post("login")
	@Throttle({ default: { limit: 15, ttl: 60 * oneSecond } })
	async login(@Body() loginDto: LoginDto) {
		const user = await this.authService.validateUser(loginDto.email, loginDto.password);

		if (!user) {
			throw new UnauthorizedException("Credenciais inválidas");
		}

		return this.authService.login(user);
	}
}
