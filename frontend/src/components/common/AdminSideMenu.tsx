import { Box, VStack, Text, Button, Flex } from "@chakra-ui/react";
import { useAuth } from "contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface AdminRoute {
	name: string;
	path: string;
}

const adminRoutes: AdminRoute[] = [
	{ name: "Trilhas", path: "/admin/trails" },
	{ name: "Categorias", path: "/admin/categories" },
	{ name: "Módulos", path: "/admin/modules" },
	{ name: "Desafios", path: "/admin/challenges" },
	{ name: "Usuários", path: "/admin/users" },
];

export const AdminSideMenu = () => {
	const { user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<Box w="250px" h="90vh" bg="gray.100" p={4} boxShadow="md">
			<Flex align="center" mb={8}>
				<Box>
					<Text fontWeight="bold">{user?.fullName}</Text>
					<Text fontSize="sm" color="gray.600">
						Administrador
					</Text>
				</Box>
			</Flex>

			<Text fontSize="sm" fontWeight="bold" mb={4} color="gray.600">
				Menu do Admin
			</Text>

			<VStack gap={2} align="stretch">
				{adminRoutes.map((route) => (
					<Button
						key={route.path}
						w="full"
						justifyContent="flex-start"
						variant={location.pathname === route.path ? "solid" : "ghost"}
						onClick={() => navigate(route.path)}
					>
						<Text truncate>{route.name}</Text>
					</Button>
				))}
			</VStack>
		</Box>
	);
};

export default AdminSideMenu;
