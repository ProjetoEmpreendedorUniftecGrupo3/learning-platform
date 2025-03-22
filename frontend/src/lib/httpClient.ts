import axios, { AxiosError, AxiosInstance } from "axios";
import { AuthService } from "services/authService";

type ErrorHandler = (error: {
	title: string;
	description?: string;
	status: "error" | "success" | "warning" | "info";
}) => void;

export class HttpClient {
	private static instance: AxiosInstance;
	private static errorHandler: ErrorHandler = () => {};

	static initialize() {
		this.instance = axios.create({
			baseURL: import.meta.env.VITE_API_URL,
			headers: {
				"Content-Type": "application/json",
			},
		});

		this.setupInterceptors();
	}

	static setErrorHandler(handler: ErrorHandler) {
		this.errorHandler = handler;
	}

	private static setupInterceptors() {
		this.instance.interceptors.request.use((config) => {
			const token = AuthService.getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		this.instance.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				if (error.response) {
					const { statusCode, message } = error.response.data as {
						message: string;
						statusCode: number;
						error: string;
					};

					this.handleError(statusCode, message);
				}

				return Promise.reject(error);
			},
		);
	}

	private static handleError(status: number, message: string) {
		this.errorHandler({
			title: `Erro ${status}`,
			description: message,
			status: "error",
		});
		switch (status) {
			case 401:
				AuthService.logout();
				break;

			case 403:
				window.location.reload();
				break;
		}
	}

	static async get<T>(url: string) {
		return this.instance.get<T>(url);
	}

	static async post<T>(url: string, data?: unknown) {
		return this.instance.post<T>(url, data);
	}

	static async put<T>(url: string, data?: unknown) {
		return this.instance.put<T>(url, data);
	}

	static async delete<T>(url: string) {
		return this.instance.delete<T>(url);
	}
}

// Inicialização imediata
HttpClient.initialize();
