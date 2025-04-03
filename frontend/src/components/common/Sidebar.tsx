import { Box, Flex, Text, Button, Skeleton } from "@chakra-ui/react";
import { useAuth } from "contexts/AuthContext";
import { useTrail } from "contexts/UserContext";
import { HttpClient } from "lib/httpClient";
import { useEffect, useState } from "react";

export const Sidebar = () => {
	const [trails, setTrails] = useState<{ id: string; name: string }[]>([]);
	const [loadingTrails, setLoadingTrails] = useState(true);
	const { selectedTrailId, setSelectedTrailId } = useTrail();
	const { user, isLoading } = useAuth();

	useEffect(() => {
		const fetchTrails = async () => {
			try {
				const response = await HttpClient.get<{ id: string; name: string }[]>("/trails");
				setTrails(response.data);
			} catch (error) {
				console.error("Erro ao buscar trilhas:", error);
			} finally {
				setLoadingTrails(false);
			}
		};

		fetchTrails();
	}, []);

	return (
		<Box w="250px" h="90vh" bg="gray.100" p={4} boxShadow="md">
			{/* Seção do Usuário */}
			<Flex align="center" mb={8}>
				<Box>
					<Skeleton loading={isLoading}>
						<Text fontWeight="bold">{user?.fullName || "Carregando..."}</Text>
						<Text fontSize="sm" color="gray.600">
							{user?.email}
						</Text>
					</Skeleton>
				</Box>
			</Flex>

			{/* Lista de Trilhas */}
			<Text fontSize="sm" fontWeight="bold" mb={4} color="gray.600">
				Minhas Trilhas
			</Text>

			{loadingTrails
				? Array(3)
						.fill(0)
						.map((_, i) => <Skeleton key={i} h="40px" mb={2} />)
				: trails.map((trail) => (
						<Button
							key={trail.id}
							w="full"
							justifyContent="flex-start"
							mb={2}
							variant={selectedTrailId === trail.id ? "solid" : "ghost"}
							onClick={() => setSelectedTrailId(trail.id)}
						>
							{trail.name}
						</Button>
					))}
		</Box>
	);
};
