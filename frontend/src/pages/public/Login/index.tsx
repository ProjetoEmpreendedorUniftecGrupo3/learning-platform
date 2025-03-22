import { useAuth } from "contexts/AuthContext";
import { useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, error, isLoading } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(email, password);
		} catch (e) {
			// Erro já tratado no contexto
			console.log(e);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Senha"
			/>
			<button type="submit" disabled={isLoading}>
				{isLoading ? "Entrando..." : "Entrar"}
			</button>
			{error && <div className="error">{error}</div>}

			{/* Login mockado para testes */}
			<div className="mock-logins">
				<button
					type="button"
					onClick={() => {
						setEmail("user@example.com");
						setPassword("user123");
					}}
				>
					Preencher User
				</button>

				<button
					type="button"
					onClick={() => {
						setEmail("admin@example.com");
						setPassword("admin123");
					}}
				>
					Preencher Admin
				</button>
			</div>
		</form>
	);
}
