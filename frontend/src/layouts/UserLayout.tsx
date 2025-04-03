import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import { Box, Flex, VStack } from "@chakra-ui/react";
import { Sidebar } from "components/common/Sidebar";

export default function UserLayout() {
	return (
		<VStack align="stretch" minH="100vh" gap="0">
			<Header />
			<Flex height="90vh">
				<Sidebar />
				<Box>
					<Outlet />
				</Box>
			</Flex>
		</VStack>
	);
}
