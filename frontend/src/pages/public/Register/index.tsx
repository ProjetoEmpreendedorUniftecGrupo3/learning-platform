import { Box, Heading, Text, Link, Button, Input, Field, Spinner } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AuthService } from "services/authService"; // Ajuste o caminho conforme necessário
import { toaster } from "components/ui/toaster";
import { useNavigate } from "react-router-dom";

// Schema de validação (mantido igual)
const registerSchema = yup.object().shape({
	fullName: yup.string().required("Nome obrigatório"),
	email: yup.string().email("E-mail inválido").required("E-mail obrigatório"),
	password: yup
		.string()
		.required("Senha obrigatória")
		.min(8, "Mínimo 8 caracteres")
		.matches(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
		.matches(/[0-9]/, "Deve conter pelo menos um número")
		.matches(/[!@#$%^&*(),.?":{}|<>]/, "Deve conter pelo menos um caractere especial"),
	confirmPassword: yup
		.string()
		.required("Confirme sua senha")
		.oneOf([yup.ref("password")], "As senhas não coincidem"),
	birthDate: yup.date().required("Data de nascimento obrigatória"),
});

type RegisterFormData = {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
	birthDate: Date;
};

export default function RegisterPage() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: yupResolver(registerSchema),
	});

	const navigate = useNavigate();

	const onSubmit = async ({ fullName, email, password, birthDate }: RegisterFormData) => {
		try {
			const payload = {
				fullName,
				email,
				password,
				birthDate: birthDate.toISOString(),
			};

			await AuthService.register(payload);

			toaster.create({
				title: "Conta criada!",
				description: "Registro realizado com sucesso",
				type: "success",
			});

			navigate("/login");
		} catch (e) {
			console.log("REGISTER ERROR", e);
		}
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
				Criar nova conta
			</Heading>

			<Text textAlign="center" mb={8}>
				Já tem conta?{" "}
				<Link href="/login" color="blue.500" fontWeight="semibold">
					Entrar
				</Link>
			</Text>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Field.Root mb={4} invalid={!!errors.fullName}>
					<Field.Label>NOME</Field.Label>
					<Input placeholder="Fulano da Silva" {...register("fullName")} />
					<Field.ErrorText>{errors.fullName?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root mb={4} invalid={!!errors.email}>
					<Field.Label>E-MAIL</Field.Label>
					<Input placeholder="fulano@gmail.com" {...register("email")} />
					<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root mb={4} invalid={!!errors.password}>
					<Field.Label>SENHA</Field.Label>
					<Input type="password" placeholder="••••••••" {...register("password")} />
					<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root mb={4} invalid={!!errors.confirmPassword}>
					<Field.Label>CONFIRMAR SENHA</Field.Label>
					<Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
					<Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root mb={6} invalid={!!errors.birthDate}>
					<Field.Label>DATA DE NASCIMENTO</Field.Label>
					<Input type="date" placeholder="dd/mm/aaaa" {...register("birthDate")} />
					<Field.ErrorText>{errors.birthDate?.message}</Field.ErrorText>
				</Field.Root>

				<Button
					type="submit"
					colorScheme="blue"
					width="full"
					loading={isSubmitting}
					loadingText="Cadastrando..."
					spinner={<Spinner size="sm" />}
				>
					Cadastrar
				</Button>
			</form>
		</Box>
	);
}
