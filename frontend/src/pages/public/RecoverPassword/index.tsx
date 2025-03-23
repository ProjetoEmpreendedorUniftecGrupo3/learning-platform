import { Box, Heading, Text, Button, Input, Field, Spinner } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { AuthService } from "services/authService";
import { toaster } from "components/ui/toaster";

// Schema de validação
const recoverSchema = yup.object().shape({
	email: yup.string().email("E-mail inválido").required("E-mail obrigatório"),
});

type RecoverFormData = {
	email: string;
};

export default function RecoverPasswordPage() {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RecoverFormData>({
		resolver: yupResolver(recoverSchema),
	});

	const onSubmit = async (data: RecoverFormData) => {
		try {
			await AuthService.recoverPassword(data.email);

			toaster.create({
				title: "E-mail enviado!",
				description: "Verifique sua caixa de entrada para redefinir a senha",
				type: "success",
			});

			navigate("/login");
		} catch (e) {
			console.log("RECOVER PASSWORD ERROR: ", e);
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
				Recuperar senha
			</Heading>

			<Text textAlign="center" mb={8} color="gray.600">
				Digite seu e-mail cadastrado para receber o link de redefinição de senha
			</Text>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Field.Root mb={6} invalid={!!errors.email}>
					<Field.Label>E-MAIL</Field.Label>
					<Input type="email" placeholder="fulano@gmail.com" {...register("email")} />
					<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
				</Field.Root>

				<Button
					type="submit"
					colorScheme="blue"
					width="full"
					loading={isSubmitting}
					loadingText="Enviando..."
					spinner={<Spinner size="sm" />}
				>
					Enviar
				</Button>
			</form>
		</Box>
	);
}
