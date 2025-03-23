import { User } from "@/users/entities/user.entity";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as nodemailer from "nodemailer";
import { UsersService } from "../users/users.service";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findByEmail(email);

		if (user && (await bcrypt.compare(pass, user.password))) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async login(user: User) {
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			role: user.role,
		};

		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async generatePasswordResetToken(email: string): Promise<string> {
		const user = await this.usersService.findByEmail(email);
		if (!user) return null;

		const payload = {
			sub: user.id,
			email: user.email,
			type: "password_reset",
		};

		return this.jwtService.sign(payload, {
			secret: this.configService.get("JWT_RESET_SECRET"),
			expiresIn: "1h",
		});
	}

	async sendResetEmail(email: string, token: string): Promise<void> {
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

		const transporter =
			this.configService.get("NODE_ENV") === "development"
				? await (async () => {
						const account = await nodemailer.createTestAccount();
						return nodemailer.createTransport({
							host: account.smtp.host,
							port: account.smtp.port,
							secure: account.smtp.secure,
							auth: {
								user: account.user,
								pass: account.pass,
							},
						});
					})()
				: nodemailer.createTransport({
						service: "Gmail",
						auth: {
							user: process.env.EMAIL_USER,
							pass: process.env.EMAIL_PASSWORD,
						},
					});

		const response = await transporter.sendMail({
			from: process.env.EMAIL_FROM,
			to: email,
			subject: "Redefinição de Senha",
			html: `
			<p>Clique no link abaixo para redefinir sua senha:</p>
			<a href="${resetUrl}">${resetUrl}</a>
			<p>Este link expira em 1 hora.</p>
		  `,
		});

		if (this.configService.get("NODE_ENV") === "development") {
			console.log(`Mensagem enviada como sucesso para: ${email}`);
			console.log("Preview URL: %s", nodemailer.getTestMessageUrl(response));
		}
	}

	async resetPassword(token: string, newPassword: string): Promise<User> {
		try {
			const payload = this.jwtService.verify(token, {
				secret: this.configService.get("JWT_RESET_SECRET"),
			});

			if (payload.type !== "password_reset") {
				throw new Error("Token inválido");
			}

			const user = await this.usersService.findById(payload.sub);
			if (!user) throw new Error("Usuário não encontrado");

			return this.usersService.updatePassword(user.id, newPassword);
		} catch (error) {
			throw new BadRequestException("Token inválido ou expirado");
		}
	}
}
