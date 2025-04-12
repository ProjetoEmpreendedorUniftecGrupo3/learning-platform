import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ValidationError } from "class-validator";
import { AppModule } from "./app.module";

const mergeCildrenErrors = (errors: ValidationError[]) => {
	return errors.reduce((acc: string[], curr: ValidationError) => {
		if (curr.children) {
			mergeCildrenErrors(curr.children).forEach((childrenError) => {
				acc.push(curr.property + " " + childrenError);
			});
		}
		acc.push(...Object.values(curr.constraints || {}));

		return acc;
	}, []);
};

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
						errors: error.constraints
							? Object.values(error.constraints)
							: mergeCildrenErrors(error.children),
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
