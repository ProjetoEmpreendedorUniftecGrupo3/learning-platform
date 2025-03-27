import { Expose, Type } from "class-transformer";

class ModuleDto {
	@Expose()
	id: string;

	@Expose()
	title: string;

	@Expose()
	completed: boolean;
}

class ChallengeDto {
	@Expose()
	id: string;

	@Expose()
	completed: boolean;
}

class CategoryDto {
	@Expose()
	id: string;

	@Expose()
	name: string;

	@Expose()
	order: number;

	@Expose()
	@Type(() => ModuleDto)
	modules: ModuleDto[];

	@Expose()
	@Type(() => ChallengeDto)
	challenge: ChallengeDto | null;

	@Expose()
	blocked: boolean;
}

export class TrailResponseDto {
	@Expose()
	trail: {
		id: string;
		name: string;
		categories: CategoryDto[];
	};
}
