import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import { VStack } from "@chakra-ui/react";

export default function UserLayout() {
	return (
		<VStack align="stretch" minH="100vh">
			<Header />
			<Outlet />
		</VStack>
	);
}
