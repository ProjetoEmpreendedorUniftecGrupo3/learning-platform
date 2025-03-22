import { HttpClient } from "lib/httpClient";
import { User } from "types/user";

export class UserService {
	static async getAllUsers(): Promise<User[]> {
		const response = await HttpClient.get<User[]>("/users");
		return response.data;
	}

	static async getUserById(id: string): Promise<User> {
		const response = await HttpClient.get<User>(`/users/${id}`);
		return response.data;
	}
}
