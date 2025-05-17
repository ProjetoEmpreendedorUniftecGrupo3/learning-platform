import {
	VStack,
	Text,
	Spinner,
	Button,
	Input,
	Field,
	Select,
	createListCollection,
	Flex,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HttpClient } from "lib/httpClient";
import { toaster } from "components/ui/toaster";
import { Category } from "types/trail";
import { useTrail } from "contexts/TrailContext";

interface CategoryFormData {
	name: string;
	trailId: string | null;
}

interface TrailListItem {
	id: string;
	name: string;
}

export const CategoryForm = () => {
	const { id } = useParams();
	const { selectedTrailId, setSelectedTrailId } = useTrail();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(!!id);
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState<CategoryFormData>({
		name: "",
		trailId: id ? null : selectedTrailId,
	});
	const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
	const [trails, setTrails] = useState<TrailListItem[]>([]);
	const [loadingTrails, setLoadingTrails] = useState(true);

	useEffect(() => {
		if (id) fetchCategory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const fetchTrails = async () => {
		try {
			const { data } = await HttpClient.get<TrailListItem[]>("/trails");
			setTrails(data);
		} catch (e) {
			console.log("GET ALL TRAILS ERROR: ", e);
		} finally {
			setLoadingTrails(false);
		}
	};

	useEffect(() => {
		fetchTrails();
	}, []);

	const fetchCategory = async () => {
		try {
			const { data } = await HttpClient.get<Category & { trail: TrailListItem }>(
				`/categories/${id}`,
			);
			setFormData({ name: data.name, trailId: data.trail.id });
		} catch (e) {
			console.error("GET CATEGORY ERROR:", e);
			navigate("/admin/categories");
		} finally {
			setLoading(false);
		}
	};

	const validateForm = () => {
		const newErrors: Partial<CategoryFormData> = {};
		if (!formData.name.trim()) {
			newErrors.name = "Nome é obrigatório";
		}

		if (!formData.trailId) {
			newErrors.trailId = "Trilha é obrigatória";
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
				await HttpClient.put(`/categories/${id}`, formData);
				toaster.create({
					title: "Sucesso",
					description: "Categoria atualizada com sucesso",
					type: "success",
				});
			} else {
				await HttpClient.post("/categories", formData);
				toaster.create({
					title: "Sucesso",
					description: "Categoria criada com sucesso",
					type: "success",
				});
			}
			setSelectedTrailId(formData.trailId!);
			navigate("/admin/categories");
		} catch (e) {
			console.error("SAVE Category ERROR:", e);
		} finally {
			setSubmitting(false);
		}
	};

	const selectOptions = useMemo(() => {
		return createListCollection({
			items: trails.map((t) => ({ label: t.name, value: t.id })),
		});
	}, [trails]);

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
				{id ? "Editar" : "Criar"} Categoria
			</Text>
			<form onSubmit={handleSubmit}>
				<VStack gap={4} align="stretch">
					<Field.Root invalid={!!errors.trailId}>
						<Select.Root
							collection={selectOptions}
							value={formData.trailId ? [formData.trailId] : undefined}
							onValueChange={(e) => {
								setFormData((prev) => ({ ...prev, trailId: e.value[0] }));
							}}
							disabled={loadingTrails}
						>
							<Select.HiddenSelect />
							<Select.Control>
								<Select.Trigger>
									{loadingTrails ? (
										<Flex width="100%" justifyContent="center">
											<Spinner size="xs" />
										</Flex>
									) : (
										<Select.ValueText placeholder="Selecione uma trilha" />
									)}
								</Select.Trigger>
								{!loadingTrails ? (
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								) : null}
							</Select.Control>
							<Select.Positioner>
								<Select.Content>
									{selectOptions.items.map((framework) => (
										<Select.Item item={framework} key={framework.value}>
											{framework.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Select.Root>

						{errors.trailId && <Field.ErrorText>{errors.trailId}</Field.ErrorText>}
					</Field.Root>

					<Field.Root invalid={!!errors.name} required>
						<Field.Label>Nome</Field.Label>
						<Input
							value={formData.name}
							onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
							placeholder="Nome da categoria"
						/>
						{errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
					</Field.Root>
					<Flex gap="24px">
						<Button variant="subtle" onClick={() => navigate("/admin/categories")} flex={1}>
							Cancelar
						</Button>
						<Button type="submit" colorScheme="green" loading={submitting} flex={1}>
							{id ? "Atualizar" : "Criar"}
						</Button>
					</Flex>
				</VStack>
			</form>
		</VStack>
	);
};
