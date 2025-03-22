// contexts/AuthContext.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from "react";

type User = {
	id: string;
	email: string;
	role: "user" | "admin";
};

type AuthContextType = {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	hasRole: (requiredRole: "user" | "admin") => boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Mock: API para login e obter token JWT
	const mockLogin = async (email: string, password: string) => {
		await new Promise((resolve) => setTimeout(resolve, 500)); // Simula delay de rede

		// Credenciais mockadas (substituir por suas regras de negócio)
		if (email === "user@example.com" && password === "user123") {
			return "mock-jwt-token-user";
		}
		if (email === "admin@example.com" && password === "admin123") {
			return "mock-jwt-token-admin";
		}
		throw new Error("Credenciais inválidas");
	};

	// Mock: API para obter dados do usuário com o token JWT
	const mockGetUserData = async (token: string) => {
		await new Promise((resolve) => setTimeout(resolve, 300)); // Simula delay de rede

		// Decodificar token mockado (em produção, usar lib como jwt-decode)
		if (token === "mock-jwt-token-user") {
			return { id: "1", email: "user@example.com", role: "user" } as User;
		}
		if (token === "mock-jwt-token-admin") {
			return { id: "2", email: "admin@example.com", role: "admin" } as User;
		}
		throw new Error("Token inválido");
	};

	const login = async (email: string, password: string) => {
		try {
			setIsLoading(true);
			setError(null);

			// 1. Obter token JWT
			const authToken = await mockLogin(email, password);

			// 2. Obter dados do usuário com o token
			const userData = await mockGetUserData(authToken);

			// 3. Atualizar estado e localStorage
			setToken(authToken);
			setUser(userData);
			localStorage.setItem("authToken", authToken);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro desconhecido");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("authToken");
	};

	const hasRole = (requiredRole: "user" | "admin") => {
		return user?.role === requiredRole;
	};

	// Verificar token ao carregar o app
	useEffect(() => {
		const initializeAuth = async () => {
			const storedToken = localStorage.getItem("authToken");
			if (storedToken) {
				try {
					setIsLoading(true);
					const userData = await mockGetUserData(storedToken);
					setUser(userData);
					setToken(storedToken);
				} catch (e) {
					console.log("AUTH ERROR: ", e);
					logout();
				} finally {
					setIsLoading(false);
				}
			}
		};

		initializeAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ user, token, isLoading, error, login, logout, hasRole }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
