import { VStack, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const UserDashboardPage = () => {
	const navigate = useNavigate();

	return (
		<VStack justify="center" minH="90vh">
			<Text fontSize="2xl">Dashboard do Usuário</Text>
			<Button
				onClick={() => {
					navigate("/user/trail/d69918a0-ce41-4554-b760-cc036d65298f");
				}}
			>
				Ir para trilha
			</Button>
		</VStack>
	);
};
