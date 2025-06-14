import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { PublicLayout } from "layouts/PublicLayout";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

import UserLayout from "layouts/UserLayout";
import TrailPage from "pages/auth/Trail";
import { AdminLayout } from "layouts/AdminLayout";
import { AdminTrailsPage } from "pages/admin/Trails";
import LoginPage from "pages/public/Login";
import { ProtectedRoute } from "common/ProtectedRoute";
import { PublicOnlyRoute } from "common/PublicOnlyRoute";
import { useEffect } from "react";
import { HttpClient } from "lib/httpClient";
import { toaster, Toaster } from "components/ui/toaster";
import RegisterPage from "pages/public/Register";
import RecoverPasswordPage from "pages/public/RecoverPassword";
import ResetPasswordPage from "pages/public/ResetPassword";
import { TrailProvider } from "contexts/TrailContext";
import { TrailForm } from "pages/admin/TrailForm";
import { AdminCategoriesPage } from "pages/admin/Categories";
import { CategoryForm } from "pages/admin/CategoryForm";
import { AdminModulesPage } from "pages/admin/Modules";
import { ModuleForm } from "pages/admin/ModuleForm";
import { CategoryProvider } from "contexts/CategoryContext";
import { ModuleContentsPage } from "pages/admin/ModuleContents";
import { AdminChallengesPage } from "pages/admin/Challenges";
import { ChallengeForm } from "pages/admin/ChallengeForm";
import { ChallengeQuestionsPage } from "pages/admin/ChallengeQuestions";
import { AdminUsersPage } from "pages/admin/Users";

export default function App() {
	useEffect(() => {
		HttpClient.setErrorHandler(({ title, description, status }) => {
			toaster.create({
				title,
				description,
				duration: 5000,
				type: status,
			});
		});
	}, []);
	return (
		<ChakraProvider value={defaultSystem}>
			<Toaster />
			<AuthProvider>
				<TrailProvider>
					<CategoryProvider>
						<BrowserRouter>
							<Routes>
								{/* Rotas Públicas */}
								<Route element={<PublicOnlyRoute />}>
									<Route element={<PublicLayout />}>
										<Route path="/login" element={<LoginPage />} />
										<Route path="/register" element={<RegisterPage />} />
										<Route path="/recover-password" element={<RecoverPasswordPage />} />
										<Route path="/reset-password" element={<ResetPasswordPage />} />
									</Route>
								</Route>

								{/* Rotas de Usuário */}
								<Route element={<ProtectedRoute requiredRole="user" />}>
									<Route element={<UserLayout />}>
										<Route path="/user/trail" element={<TrailPage />} />
									</Route>
								</Route>

								{/* Rotas de Admin */}
								<Route element={<ProtectedRoute requiredRole="admin" />}>
									<Route element={<AdminLayout />}>
										<Route path="/admin/trails" element={<AdminTrailsPage />} />
										<Route path="/admin/trails/create" element={<TrailForm />} />
										<Route path="/admin/trails/edit/:id" element={<TrailForm />} />
										<Route path="/admin/categories" element={<AdminCategoriesPage />} />
										<Route path="/admin/categories/create" element={<CategoryForm />} />
										<Route path="/admin/categories/edit/:id" element={<CategoryForm />} />
										<Route path="/admin/modules" element={<AdminModulesPage />} />
										<Route path="/admin/modules/create" element={<ModuleForm />} />
										<Route path="/admin/modules/edit/:id" element={<ModuleForm />} />
										<Route path="/admin/challenges" element={<AdminChallengesPage />} />
										<Route path="/admin/challenges/create" element={<ChallengeForm />} />
										<Route
											path="/admin/challenges/:challengeId/questions"
											element={<ChallengeQuestionsPage />}
										/>
										<Route
											path="/admin/modules/:moduleId/contents"
											element={<ModuleContentsPage />}
										/>
										<Route path="/admin/users" element={<AdminUsersPage />} />
									</Route>
								</Route>

								{/* Redirecionamentos */}
								<Route path="/admin" element={<Navigate to="/admin/trails" replace />} />
								<Route path="/user" element={<Navigate to="/user/trail" replace />} />
								<Route path="*" element={<Navigate to="/login" />} />
							</Routes>
						</BrowserRouter>
					</CategoryProvider>
				</TrailProvider>
			</AuthProvider>
		</ChakraProvider>
	);
}
