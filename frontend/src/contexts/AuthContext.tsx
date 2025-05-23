// contexts/AuthContext.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { AuthService } from "services/authService";
import { User } from "types/user";

type AuthContextType = {
	user: User | null;
	isLoading: boolean;
	login: (data: { email: string; password: string }) => Promise<void>;
	logout: () => void;
	hasRole: (requiredRole: "user" | "admin") => boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const login = async ({ email, password }: { email: string; password: string }) => {
		try {
			setIsLoading(true);
			const token = await AuthService.login(email, password);
			const user = await AuthService.getMe();
			setUser(user);
			localStorage.setItem("authToken", token);
		} catch (e) {
			console.log("LOGIN ERROR: ", e);
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.clear();
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
					const userData = await AuthService.getMe();
					setUser(userData);
				} catch (e) {
					console.log("AUTH ERROR: ", e);
					logout();
				}
			}
			setIsLoading(false);
		};

		initializeAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
			{children}
		</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
