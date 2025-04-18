import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";

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

	async findAll(): Promise<User[]> {
		const users = await this.usersRepository.find();
		return users;
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
