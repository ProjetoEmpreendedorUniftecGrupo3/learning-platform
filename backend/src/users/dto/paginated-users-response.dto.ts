import { UserResponseDto } from "./user-response-dto";

export class PaginationMetaDto {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export class PaginatedUsersResponseDto {
	data: UserResponseDto[];
	meta: PaginationMetaDto;

	constructor(users: UserResponseDto[], total: number, page: number, limit: number) {
		this.data = users;
		this.meta = {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
			hasPreviousPage: page > 1,
			hasNextPage: page < Math.ceil(total / limit),
		};
	}
}
