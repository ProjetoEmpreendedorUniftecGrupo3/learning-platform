import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class FindAllUsersDto {
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	search?: string;

	@IsOptional()
	@IsString()
	@IsIn(["fullName", "email", "birthDate", "createdAt"], {
		message: "sortBy deve ser um dos seguintes valores: fullName, email, birthDate, createdAt",
	})
	sortBy?: "fullName" | "email" | "birthDate" | "createdAt";

	@IsOptional()
	@IsString()
	@IsIn(["ASC", "DESC"], {
		message: "sortOrder deve ser ASC ou DESC",
	})
	sortOrder?: "ASC" | "DESC";

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt({ message: "page deve ser um número inteiro" })
	@Min(1, { message: "page deve ser maior que 0" })
	page?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt({ message: "limit deve ser um número inteiro" })
	@Min(1, { message: "limit deve ser maior que 0" })
	@Max(100, { message: "limit não pode ser maior que 100" })
	limit?: number;
}
