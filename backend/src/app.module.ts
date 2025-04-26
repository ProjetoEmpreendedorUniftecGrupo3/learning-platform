import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { ChallengeCompletionModule } from "./challenge-completions/challenge-completion.module";
import { ChallengeQuestionsModule } from "./challenge-questions/challenge-questions.module";
import { ChallengesModule } from "./challenges/challenges.module";
import { ModuleCompletionModule } from "./module-completions/module-completion.module";
import { ModuleContentModule } from "./module-contents/module-contents.module";
import { ModulesModule } from "./modules/modules.module";
import { TrailsModule } from "./trails/trails.module";
import { UsersModule } from "./users/users.module";
const oneSecond = 1000;
@Module({
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				host: configService.get<string>("DB_HOST"),
				port: configService.get<number>("DB_PORT"),
				username: configService.get<string>("DB_USERNAME"),
				password: configService.get<string>("DB_PASSWORD"),
				database: configService.get<string>("DB_DATABASE"),
				entities: [__dirname + "/**/*.entity{.ts,.js}"],
				extra: {
					// Habilita UUID no PostgreSQL
					extension: "uuid-ossp",
				},
				ssl: {
					rejectUnauthorized: false,
				},
				synchronize: true,
			}),
			inject: [ConfigService],
		}),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => [
				{
					ttl: config.get<number>("THROTTLE_TTL", 60) * oneSecond, // Tempo em segundos
					limit: config.get<number>("THROTTLE_LIMIT", 100), // Requisições por TTL
				},
			],
		}),

		UsersModule,
		AuthModule,
		TrailsModule,
		CategoriesModule,
		ChallengeCompletionModule,
		ChallengesModule,
		ModuleCompletionModule,
		ModulesModule,
		ModuleContentModule,
		ChallengeQuestionsModule,
	],
})
export class AppModule {}
