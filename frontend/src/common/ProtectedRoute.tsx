import { useAuth } from "contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

type ProtectedRouteProps = {
	requiredRole?: "user" | "admin";
	redirectTo?: string;
};

export const ProtectedRoute = ({ requiredRole, redirectTo = "/login" }: ProtectedRouteProps) => {
	const { user, isLoading } = useAuth();

	if (isLoading) return <div>Carregando...</div>;

	if (!user) return <Navigate to={redirectTo} replace />;

	if (requiredRole && user.role !== requiredRole) {
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
};
