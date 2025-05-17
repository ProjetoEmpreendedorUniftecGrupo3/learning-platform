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
	Textarea,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HttpClient } from "lib/httpClient";
import { toaster } from "components/ui/toaster";
import { useCategory } from "contexts/CategoryContext";

interface ModuleFormData {
	title: string;
	description: string;
	categoryId: string | null;
}

interface CategoryListItem {
	id: string;
	name: string;
}

interface Module {
	id: string;
	title: string;
	description: string;
	category: CategoryListItem;
}

export const ModuleForm = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { selectedCategoryId, setSelectedCategoryId } = useCategory();
	const [loading, setLoading] = useState(!!id);
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState<ModuleFormData>({
		title: "",
		description: "",
		categoryId: id ? null : selectedCategoryId,
	});
	const [errors, setErrors] = useState<Partial<ModuleFormData>>({});
	const [categories, setCategories] = useState<CategoryListItem[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);

	useEffect(() => {
		if (id) fetchModule();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const fetchCategories = async () => {
		try {
			const { data } = await HttpClient.get<CategoryListItem[]>("/categories");
			setCategories(data);
		} catch (e) {
			console.log("GET ALL CATEGORIES ERROR: ", e);
		} finally {
			setLoadingCategories(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchModule = async () => {
		try {
			const { data } = await HttpClient.get<Module>(`/modules/${id}`);
			setFormData({
				title: data.title,
				description: data.description,
				categoryId: data.category.id,
			});
		} catch (e) {
			console.error("GET MODULE ERROR:", e);
			navigate("/admin/modules");
		} finally {
			setLoading(false);
		}
	};

	const validateForm = () => {
		const newErrors: Partial<ModuleFormData> = {};
		if (!formData.title.trim()) {
			newErrors.title = "Título é obrigatório";
		}

		if (!formData.description.trim()) {
			newErrors.description = "Descrição é obrigatória";
		}

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
			if (id) {
				await HttpClient.put(`/modules/${id}`, formData);
				toaster.create({
					title: "Sucesso",
					description: "Módulo atualizado com sucesso",
					type: "success",
				});
			} else {
				await HttpClient.post("/modules", formData);
				toaster.create({
					title: "Sucesso",
					description: "Módulo criado com sucesso",
					type: "success",
				});
			}
			setSelectedCategoryId(formData.categoryId!);
			navigate("/admin/modules");
		} catch (e) {
			console.error("SAVE MODULE ERROR:", e);
		} finally {
			setSubmitting(false);
		}
	};

	const selectOptions = useMemo(() => {
		return createListCollection({
			items: categories.map((category) => ({ label: category.name, value: category.id })),
		});
	}, [categories]);

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
				{id ? "Editar" : "Criar"} Módulo
			</Text>
			<form onSubmit={handleSubmit}>
				<VStack gap={4} align="stretch">
					<Field.Root invalid={!!errors.categoryId}>
						<Field.Label>Categoria</Field.Label>
						<Select.Root
							collection={selectOptions}
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
									{selectOptions.items.map((category) => (
										<Select.Item item={category} key={category.value}>
											{category.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Select.Root>
						{errors.categoryId && <Field.ErrorText>{errors.categoryId}</Field.ErrorText>}
					</Field.Root>

					<Field.Root invalid={!!errors.title}>
						<Field.Label>Título</Field.Label>
						<Input
							value={formData.title}
							onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
							placeholder="Título do módulo"
						/>
						{errors.title && <Field.ErrorText>{errors.title}</Field.ErrorText>}
					</Field.Root>

					<Field.Root invalid={!!errors.description}>
						<Field.Label>Descrição</Field.Label>
						<Textarea
							value={formData.description}
							onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
							placeholder="Descrição do módulo"
							rows={4}
						/>
						{errors.description && <Field.ErrorText>{errors.description}</Field.ErrorText>}
					</Field.Root>

					<Flex gap="24px">
						<Button variant="subtle" onClick={() => navigate("/admin/modules")} flex={1}>
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
