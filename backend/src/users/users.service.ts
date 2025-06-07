import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { FindAllUsersDto } from "./dto/find-all-users.dto";
import { User } from "./entities/user.entity";

export interface PaginatedUsersResult {
	users: User[];
	total: number;
	page: number;
	limit: number;
}

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const user = this.usersRepository.create(createUserDto);
		return await this.usersRepository.save(user);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { email } });
	}

	async findById(id: string): Promise<User | null> {
		return this.usersRepository.findOneBy({ id });
	}

	async findAll(query?: FindAllUsersDto): Promise<PaginatedUsersResult> {
		const queryBuilder = this.usersRepository.createQueryBuilder("user");

		if (query?.search) {
			const searchTerm = query.search.replace(/[%_\\]/g, "\\$&");
			queryBuilder.where("(LOWER(user.fullName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))", {
				search: `%${searchTerm}%`,
			});
		}

		const sortBy = query?.sortBy || "createdAt";
		const sortOrder = query?.sortOrder || "DESC";

		const allowedSortFields = ["fullName", "email", "birthDate", "createdAt"];
		if (!allowedSortFields.includes(sortBy)) {
			throw new Error("Campo de ordenação inválido");
		}

		queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

		const page = query?.page || 1;
		const limit = query?.limit || 25;

		const skip = (page - 1) * limit;
		queryBuilder.skip(skip).take(limit);

		const [users, total] = await queryBuilder.getManyAndCount();

		return {
			users,
			total,
			page,
			limit,
		};
	}

	async updatePassword(userId: string, newPassword: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({ id: userId });

		if (!user) {
			throw new NotFoundException("Usuário não encontrado");
		}

		user.password = await bcrypt.hash(newPassword, 10);
		return this.usersRepository.save(user);
	}
}
