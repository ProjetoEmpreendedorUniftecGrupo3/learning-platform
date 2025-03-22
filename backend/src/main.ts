import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			exceptionFactory: (errors) => {
				const messages = errors.map((error) => {
					return {
						field: error.property,
						errors: Object.values(error.constraints),
					};
				});
				return new BadRequestException({
					statusCode: 400,
					message: "Erro de validação",
					errors: messages,
				});
			},
		}),
	);

	app.enableCors({
		origin: "*",
	});

	await app.listen(3000);
}
bootstrap();
