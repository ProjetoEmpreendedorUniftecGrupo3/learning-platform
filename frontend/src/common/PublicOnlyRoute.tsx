import { useAuth } from "contexts/AuthContext";

import { Navigate, Outlet } from "react-router-dom";

export const PublicOnlyRoute = () => {
	const { user, isLoading } = useAuth();

	if (isLoading) return <div>Carregando...</div>;

	if (user)
		return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/trails"} replace />;

	return <Outlet />;
};
