import {
	VStack,
	Text,
	Spinner,
	Button,
	Select,
	createListCollection,
	Flex,
	Field,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpClient } from "lib/httpClient";
import { toaster } from "components/ui/toaster";
import { useTrail } from "contexts/TrailContext";

interface ChallengeFormData {
	categoryId: string | null;
}

interface CategoryListItem {
	id: string;
	name: string;
	challenge?: { id: string };
	trail: {
		id: string;
		name: string;
	};
}

interface TrailListItem {
	id: string;
	name: string;
}

export const ChallengeForm = () => {
	const navigate = useNavigate();
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState<ChallengeFormData>({
		categoryId: null,
	});
	const [errors, setErrors] = useState<Partial<ChallengeFormData>>({});
	const [trails, setTrails] = useState<TrailListItem[]>([]);
	const [categories, setCategories] = useState<CategoryListItem[]>([]);
	const [loadingTrails, setLoadingTrails] = useState(true);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const { selectedTrailId, setSelectedTrailId } = useTrail();

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

	const fetchCategories = async (trailId?: string | null) => {
		setLoadingCategories(true);
		try {
			const url = trailId ? `/categories?trailId=${trailId}` : "/categories";
			const { data } = await HttpClient.get<CategoryListItem[]>(url);
			// Filtrar categorias que não têm desafios
			const categoriesWithoutChallenge = data.filter((category) => !category.challenge);
			setCategories(categoriesWithoutChallenge);
		} catch (e) {
			console.log("GET ALL CATEGORIES ERROR: ", e);
		} finally {
			setLoadingCategories(false);
		}
	};

	useEffect(() => {
		fetchTrails();
	}, []);

	useEffect(() => {
		fetchCategories(selectedTrailId);
		// Reset categoria selecionada quando trilha muda
		setFormData((prev) => ({ ...prev, categoryId: null }));
	}, [selectedTrailId]);

	const validateForm = () => {
		const newErrors: Partial<ChallengeFormData> = {};

		if (!formData.categoryId) {
			newErrors.categoryId = "Categoria é obrigatória";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setSubmitting(true);
		try {
			await HttpClient.post("/challenges", { categoryId: formData.categoryId });
			toaster.create({
				title: "Sucesso",
				description: "Desafio criado com sucesso",
				type: "success",
			});
			navigate("/admin/challenges");
		} catch (e) {
			console.error("CREATE CHALLENGE ERROR:", e);
		} finally {
			setSubmitting(false);
		}
	};

	const trailSelectOptions = useMemo(() => {
		return createListCollection({
			items: [
				{ label: "Todas", value: "all" },
				...trails.map((t) => ({ label: t.name, value: t.id })),
			],
		});
	}, [trails]);

	const categorySelectOptions = useMemo(() => {
		return createListCollection({
			items: categories.map((c) => ({ label: c.name, value: c.id })),
		});
	}, [categories]);

	return (
		<VStack align="stretch" p={6} style={{ width: `calc(100vw - 250px)`, minHeight: "90vh" }}>
			<Text fontSize="2xl" mb={6}>
				Criar Desafio
			</Text>
			<form onSubmit={handleSubmit}>
				<VStack gap={4} align="stretch">
					<Field.Root>
						<Field.Label>Trilha (para filtrar categorias)</Field.Label>
						<Select.Root
							collection={trailSelectOptions}
							value={selectedTrailId ? [selectedTrailId] : ["all"]}
							onValueChange={(e) => {
								if (e.value[0] === "all") {
									setSelectedTrailId(null);
								} else {
									setSelectedTrailId(e.value[0]);
								}
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
										<Select.ValueText placeholder="Todas as trilhas" />
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
									{trailSelectOptions.items.map((trail) => (
										<Select.Item item={trail} key={trail.value}>
											{trail.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Select.Root>
					</Field.Root>

					<Field.Root invalid={!!errors.categoryId}>
						<Field.Label>Categoria</Field.Label>
						<Select.Root
							collection={categorySelectOptions}
							value={formData.categoryId ? [formData.categoryId] : undefined}
							onValueChange={(e) => {
								setFormData((prev) => ({ ...prev, categoryId: e.value[0] }));
							}}
							disabled={loadingCategories}
						>
							<Select.HiddenSelect />
							<Select.Control>
								<Select.Trigger>
									{loadingCategories ? (
										<Flex width="100%" justifyContent="center">
											<Spinner size="xs" />
										</Flex>
									) : (
										<Select.ValueText placeholder="Selecione uma categoria" />
									)}
								</Select.Trigger>
								{!loadingCategories ? (
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								) : null}
							</Select.Control>
							<Select.Positioner>
								<Select.Content>
									{categorySelectOptions.items.length === 0 ? (
										<Text p={2} color="gray.500" fontSize="sm">
											{selectedTrailId
												? "Não há categorias sem desafio nesta trilha"
												: "Não há categorias sem desafio"}
										</Text>
									) : (
										categorySelectOptions.items.map((category) => (
											<Select.Item item={category} key={category.value}>
												{category.label}
												<Select.ItemIndicator />
											</Select.Item>
										))
									)}
								</Select.Content>
							</Select.Positioner>
						</Select.Root>
						{errors.categoryId && <Field.ErrorText>{errors.categoryId}</Field.ErrorText>}
					</Field.Root>

					<Flex gap="24px" mt={4}>
						<Button variant="subtle" onClick={() => navigate("/admin/challenges")} flex={1}>
							Cancelar
						</Button>
						<Button type="submit" loading={submitting} flex={1}>
							Criar Desafio
						</Button>
					</Flex>
				</VStack>
			</form>
		</VStack>
	);
};
