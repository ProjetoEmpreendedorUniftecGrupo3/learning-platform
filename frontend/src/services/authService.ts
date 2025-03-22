import { HttpClient } from "lib/httpClient";
import { User } from "types/user";

export class AuthService {
	static async login(email: string, password: string): Promise<string> {
		const response = await HttpClient.post<{ access_token: string }>("/auth/login", {
			email,
			password,
		});
		this.setToken(response.data.access_token);
		return response.data.access_token;
	}

	static async register(userData: {
		fullName: string;
		email: string;
		password: string;
		birthDate: string;
	}): Promise<User> {
		const response = await HttpClient.post<User>("/users/register", userData);
		return response.data;
	}

	static async getMe(): Promise<User> {
		const response = await HttpClient.get<User>("/users/me");
		return response.data;
	}

	static setToken(token: string): void {
		localStorage.setItem("access_token", token);
	}

	static getToken(): string | null {
		return localStorage.getItem("access_token");
	}

	static logout(): void {
		localStorage.removeItem("access_token");
	}
}
