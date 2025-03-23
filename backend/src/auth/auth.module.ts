import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

export const JWT_MAIN_TOKEN = "JWT_MAIN";
export const JWT_RESET_TOKEN = "JWT_RESET";

@Module({
	imports: [
		ConfigModule,
		UsersModule,
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>("JWT_SECRET"),
				signOptions: { expiresIn: "1d" },
			}),
			inject: [ConfigService],
		}),
		// Configuração adicional para reset de senha
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get("JWT_RESET_SECRET"),
				signOptions: { expiresIn: "1h" },
			}),
			inject: [ConfigService],
		}),
	],
	providers: [
		AuthService,
		JwtStrategy,
		{
			provide: JWT_MAIN_TOKEN,
			useExisting: JwtService,
		},
		{
			provide: JWT_RESET_TOKEN,
			useFactory: (configService: ConfigService) => {
				return new JwtService({
					secret: configService.get("JWT_RESET_SECRET"),
					signOptions: { expiresIn: "1h" },
				});
			},
			inject: [ConfigService],
		},
	],
	controllers: [AuthController],
})
export class AuthModule {}
