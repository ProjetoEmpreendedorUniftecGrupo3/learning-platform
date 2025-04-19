import { Box, Flex, VStack } from "@chakra-ui/react";
import Header from "../components/common/Header";
import AdminSideMenu from "../components/common/AdminSideMenu";
import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
	return (
		<VStack align="stretch" minH="100vh" gap={0}>
			<Header />
			<Flex height="90vh">
				<AdminSideMenu />
				<Box>
					<Outlet />
				</Box>
			</Flex>
		</VStack>
	);
};
