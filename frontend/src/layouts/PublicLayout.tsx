import { VStack } from "@chakra-ui/react";
import Header from "../components/common/Header";
import { Outlet } from "react-router-dom";

export const PublicLayout = () => {
	return (
		<VStack align="stretch" minH="100vh">
			<Header />
			<Outlet />
		</VStack>
	);
};
