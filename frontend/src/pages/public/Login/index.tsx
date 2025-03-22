import { Box, Heading, Text, Link, Button, Input, Flex, Field } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "contexts/AuthContext";

// Schema de validação
const loginSchema = yup.object().shape({
	email: yup.string().email("E-mail inválido").required("E-mail obrigatório"),
	password: yup.string().min(6, "Mínimo 6 caracteres").required("Senha obrigatória"),
});

type LoginFormData = {
	email: string;
	password: string;
};

export default function LoginPage() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: yupResolver(loginSchema),
	});

	const { login } = useAuth();

	const onSubmit = (data: LoginFormData) => {
		login(data);
	};

	return (
		<Box
			maxW="lg"
			w="full"
			mx="auto"
			mt={20}
			p={8}
			borderWidth={1}
			borderRadius="lg"
			boxShadow="lg"
		>
			<Heading as="h1" size="lg" mb={6} textAlign="center">
				Entrar
			</Heading>

			<Text textAlign="center" mb={8}>
				Ainda não tem conta?{" "}
				<Link href="/register" color="blue.500" fontWeight="semibold">
					Cadastre-se
				</Link>
			</Text>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Field.Root mb={4} invalid={!!errors.email}>
					<Field.Label>E-MAIL</Field.Label>
					<Input placeholder="email@gmail.com" {...register("email")} />
					<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root mb={4} invalid={!!errors.password}>
					<Field.Label>SENHA</Field.Label>
					<Input type="password" placeholder="••••••" {...register("password")} />
					<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
				</Field.Root>

				<Flex mb={6}>
					<Link color="blue.500" fontSize="sm">
						Esqueceu a senha?
					</Link>
				</Flex>

				<Button type="submit" colorScheme="blue" width="full" loading={isSubmitting}>
					Entrar
				</Button>
			</form>
		</Box>
	);
}
