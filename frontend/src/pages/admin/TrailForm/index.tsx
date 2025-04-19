import { VStack, Text, Spinner, Button, Input, Field } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HttpClient } from "lib/httpClient";
import { toaster } from "components/ui/toaster";

interface TrailFormData {
	name: string;
}

export const TrailForm = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(!!id);
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState<TrailFormData>({ name: "" });
	const [errors, setErrors] = useState<Partial<TrailFormData>>({});

	useEffect(() => {
		if (id) fetchTrail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const fetchTrail = async () => {
		try {
			const { data } = await HttpClient.get<TrailFormData>(`/trails/${id}`);
			setFormData({ name: data.name });
		} catch (e) {
			console.error("GET TRAIL ERROR:", e);
			navigate("/admin/trails");
		} finally {
			setLoading(false);
		}
	};

	const validateForm = () => {
		const newErrors: Partial<TrailFormData> = {};
		if (!formData.name.trim()) {
			newErrors.name = "Nome é obrigatório";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setSubmitting(true);
		try {
			if (id) {
				await HttpClient.put(`/trails/${id}`, formData);
				toaster.create({
					title: "Sucesso",
					description: "Trilha atualizada com sucesso",
					type: "success",
				});
			} else {
				await HttpClient.post("/trails", formData);
				toaster.create({
					title: "Sucesso",
					description: "Trilha criada com sucesso",
					type: "success",
				});
			}
			navigate("/admin/trails");
		} catch (e) {
			console.error("SAVE TRAIL ERROR:", e);
			toaster.create({
				title: "Erro",
				description: `Erro ao ${id ? "atualizar" : "criar"} trilha`,
				type: "error",
			});
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<VStack justify="center" style={{ width: `calc(100vw - 250px)`, height: "90vh" }}>
				<Spinner size="xl" />
			</VStack>
		);
	}

	return (
		<VStack align="stretch" p={6} style={{ width: `calc(100vw - 250px)`, minHeight: "90vh" }}>
			<Text fontSize="2xl" mb={6}>
				{id ? "Editar" : "Criar"} Trilha
			</Text>
			<form onSubmit={handleSubmit}>
				<VStack gap={4} align="stretch">
					<Field.Root invalid={!!errors.name} required>
						<Field.Label>Nome</Field.Label>
						<Input
							value={formData.name}
							onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
							placeholder="Nome da trilha"
						/>
						{errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
					</Field.Root>

					<Button type="submit" colorScheme="green" loading={submitting}>
						{id ? "Atualizar" : "Criar"}
					</Button>
				</VStack>
			</form>
		</VStack>
	);
};
