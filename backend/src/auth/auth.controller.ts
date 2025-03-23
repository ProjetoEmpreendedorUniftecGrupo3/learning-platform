import { Body, Controller, Post, Query, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { PasswordRecoverDto } from "./dto/passwordRecover.dto";
import { PasswordResetDto } from "./dto/passwordReset.dto";
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

	@Post("password/recover")
	@Throttle({ default: { limit: 4, ttl: 60 * oneSecond } })
	async recoverPassword(@Body() dto: PasswordRecoverDto) {
		const token = await this.authService.generatePasswordResetToken(dto.email);

		if (token) {
			await this.authService.sendResetEmail(dto.email, token);
		}

		return { message: "Se o email existir em nosso sistema, enviaremos um link de recuperação" };
	}

	@Post("password/reset")
	@Throttle({ default: { limit: 2, ttl: 60 * oneSecond } })
	async resetPassword(@Query("token") token: string, @Body() dto: PasswordResetDto) {
		await this.authService.resetPassword(token, dto.newPassword);
		return { message: "Senha redefinida com sucesso" };
	}
}
