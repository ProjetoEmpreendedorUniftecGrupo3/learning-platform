import { Flex, Button, Text } from "@chakra-ui/react";
import { useAuth } from "contexts/AuthContext";

const Header = () => {
	const { user, logout } = useAuth();

	return (
		<Flex
			h="10vh"
			as="header"
			p={4}
			bg="teal.500"
			color="white"
			justify="space-between"
			align="center"
		>
			<Text fontSize="xl">Plataforma de Aprendizado</Text>
			{user && (
				<Button colorPalette="red" onClick={logout}>
					Sair
				</Button>
			)}
		</Flex>
	);
};

export default Header;
