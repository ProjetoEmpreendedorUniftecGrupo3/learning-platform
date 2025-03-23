import { Box, Heading, Button, Input, Field, Spinner } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "services/authService";
import { toaster } from "components/ui/toaster";

// Schema de validação
const resetSchema = yup.object().shape({
	newPassword: yup
		.string()
		.required("Senha obrigatória")
		.min(8, "Mínimo 8 caracteres")
		.matches(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
		.matches(/[0-9]/, "Deve conter pelo menos um número")
		.matches(/[!@#$%^&*(),.?":{}|<>]/, "Deve conter pelo menos um caractere especial"),
	confirmPassword: yup
		.string()
		.required("Confirme sua senha")
		.oneOf([yup.ref("newPassword")], "As senhas não coincidem"),
});

type ResetFormData = {
	newPassword: string;
	confirmPassword: string;
};

export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetFormData>({
		resolver: yupResolver(resetSchema),
	});

	const onSubmit = async (data: ResetFormData) => {
		try {
			if (!token) {
				throw new Error("Token inválido ou expirado");
			}

			await AuthService.resetPassword({
				newPassword: data.newPassword,
				token,
			});

			toaster.create({
				title: "Senha alterada!",
				description: "Sua senha foi redefinida com sucesso",
				type: "success",
			});

			navigate("/login");
		} catch (error) {
			console.error("RESET PASSWORD ERROR: ", error);
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
				Redefinir senha
			</Heading>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Field.Root mb={4} invalid={!!errors.newPassword}>
					<Field.Label>NOVA SENHA</Field.Label>
					<Input type="password" placeholder="********" {...register("newPassword")} />
					<Field.ErrorText>{errors.newPassword?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root mb={6} invalid={!!errors.confirmPassword}>
					<Field.Label>CONFIRMAR SENHA</Field.Label>
					<Input type="password" placeholder="********" {...register("confirmPassword")} />
					<Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
				</Field.Root>

				<Button
					type="submit"
					colorScheme="blue"
					width="full"
					loading={isSubmitting}
					loadingText="Redefinindo..."
					spinner={<Spinner size="sm" />}
				>
					Redefinir Senha
				</Button>
			</form>
		</Box>
	);
}
