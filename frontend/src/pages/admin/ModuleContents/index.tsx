import {
	VStack,
	Text,
	Spinner,
	Button,
	HStack,
	Table,
	Dialog,
	Flex,
	EmptyState,
	Badge,
	Field,
	Input,
	Select,
	createListCollection,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HttpClient } from "lib/httpClient";
import { toaster } from "components/ui/toaster";
import { ArrowLeft } from "lucide-react";

interface ModuleContentItem {
	id: string;
	type: "document" | "video" | "blog" | "image" | "website";
	description: string;
	url: string;
}

interface Module {
	id: string;
	title: string;
	description: string;
}

interface ModuleContentFormData {
	type?: "document" | "video" | "blog" | "image" | "website";
	description: string;
	url: string;
}

export const ModuleContentsPage = () => {
	const { moduleId } = useParams();
	const navigate = useNavigate();
	const [contents, setContents] = useState<ModuleContentItem[]>([]);
	const [courseModule, setCourseModule] = useState<Module | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [creating, setCreating] = useState(false);

	const [formData, setFormData] = useState<ModuleContentFormData>({
		type: undefined,
		description: "",
		url: "",
	});

	const [editingFormData, setEditingFormData] = useState<ModuleContentFormData & { id: string }>({
		type: undefined,
		description: "",
		url: "",
		id: "",
	});

	const fetchModule = async () => {
		try {
			const { data } = await HttpClient.get<Module>(`/modules/${moduleId}`);
			setCourseModule(data);
		} catch (e) {
			console.error("GET MODULE ERROR:", e);
			navigate("/admin/modules");
		}
	};

	const fetchContents = async () => {
		try {
			const { data } = await HttpClient.get<ModuleContentItem[]>(
				`/module-contents?moduleId=${moduleId}`,
			);
			setContents(data);
		} catch (e) {
			console.error("GET MODULE CONTENTS ERROR:", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (moduleId) {
			fetchModule();
			fetchContents();
		} else {
			navigate("/admin/modules");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [moduleId]);

	const openDeleteDialog = (id: string) => {
		setDeleteId(id);
		setOpenDelete(true);
	};

	const closeDeleteDialog = () => {
		setDeleteId(null);
		setOpenDelete(false);
	};

	const handleConfirmDelete = async () => {
		if (!deleteId) return;
		setIsDeleting(true);
		try {
			await HttpClient.delete(`/module-contents/${deleteId}`);
			setContents((prev) => prev.filter((content) => content.id !== deleteId));
			toaster.create({
				title: "Sucesso",
				description: "Conteúdo excluído com sucesso",
				type: "success",
			});
		} catch (e) {
			console.error("DELETE MODULE CONTENT ERROR:", e);
		} finally {
			setIsDeleting(false);
			closeDeleteDialog();
		}
	};

	const getContentTypeBadge = (type: string) => {
		const typeColors = {
			document: "blue",
			video: "red",
			blog: "green",
			image: "purple",
			website: "orange",
		};

		const color = typeColors[type as keyof typeof typeColors] || "gray";

		return (
			<Badge colorScheme={color} size="lg">
				{type === "document" && "Documento"}
				{type === "video" && "Vídeo"}
				{type === "blog" && "Blog"}
				{type === "image" && "Imagem"}
				{type === "website" && "Website"}
			</Badge>
		);
	};

	const selectOptions = useMemo(() => {
		return createListCollection({
			items: [
				{ label: "Documento", value: "document" },
				{ label: "Vídeo", value: "video" },
				{ label: "Blog", value: "blog" },
				{ label: "Imagem", value: "image" },
				{ label: "Website", value: "website" },
			],
		});
	}, []);

	const handleUpdate = async () => {
		try {
			// Atualizar conteúdo existente
			HttpClient.put(`/module-contents/${editingFormData.id}`, {
				type: editingFormData.type,
				description: editingFormData.description,
				url: editingFormData.url,
			});

			// Atualiza a lista de conteúdos com o item editado
			setContents((prev) =>
				prev.map((item) =>
					item.id === editingFormData.id
						? {
								...item,
								type: editingFormData.type!,
								description: editingFormData.description,
								url: editingFormData.url,
							}
						: item,
				),
			);

			toaster.create({
				title: "Sucesso",
				description: "Conteúdo atualizado com sucesso",
				type: "success",
			});

			// Limpa o formulário de edição
			setEditingFormData({
				type: undefined,
				description: "",
				url: "",
				id: "",
			});
		} catch (e) {
			console.error("UPDATE MODULE CONTENT ERROR:", e);
			fetchContents();
		}
	};

	const handleCreate = async () => {
		try {
			setCreating(true);
			// Criar novo conteúdo
			const { data } = await HttpClient.post<ModuleContentItem>(`/module-contents`, {
				type: formData.type,
				description: formData.description,
				url: formData.url,
				moduleId: moduleId,
			});

			// Adicionar o novo conteúdo à lista
			setContents((prev) => [...prev, data]);

			toaster.create({
				title: "Sucesso",
				description: "Conteúdo adicionado com sucesso",
				type: "success",
			});

			// Limpar o formulário
			setFormData({
				type: undefined,
				description: "",
				url: "",
			});
			setCreating(false);
		} catch (e) {
			console.error("CREATE MODULE CONTENT ERROR:", e);
			fetchContents();
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
			<Button alignSelf="flex-start" colorPalette="red" onClick={() => navigate("/admin/modules")}>
				<ArrowLeft />
				Voltar
			</Button>
			<HStack justify="space-between" mt={2}>
				<VStack align="start" gap={1}>
					{courseModule && (
						<>
							<Text fontSize="2xl">{courseModule.title}</Text>
							<Text fontSize="sm" color="gray.500" mb={6}>
								{courseModule.description}
							</Text>
							<Text fontSize="lg" fontWeight="bold">
								Conteúdos do Módulo:
							</Text>
						</>
					)}
				</VStack>
			</HStack>

			{!contents.length ? (
				<EmptyState.Root>
					<EmptyState.Content>
						<VStack textAlign="center">
							<EmptyState.Title>Não há conteúdos neste módulo</EmptyState.Title>
							<EmptyState.Description>
								Clique no botão "Adicionar novo conteúdo" para começar
							</EmptyState.Description>
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			) : (
				<Table.ScrollArea>
					<Table.Root variant="outline">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader width="160px">Tipo</Table.ColumnHeader>
								<Table.ColumnHeader>Descrição</Table.ColumnHeader>
								<Table.ColumnHeader>URL</Table.ColumnHeader>
								<Table.ColumnHeader width="120px" textAlign="end">
									Ações
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{contents.map((content) => (
								<Table.Row key={content.id} height="65px">
									{editingFormData.id === content.id ? (
										<>
											<Table.Cell>
												<Select.Root
													collection={selectOptions}
													value={editingFormData.type ? [editingFormData.type] : undefined}
													onValueChange={(e) => {
														setEditingFormData((prev) => ({
															...prev,
															type: e.value[0] as
																| "document"
																| "video"
																| "blog"
																| "image"
																| "website"
																| undefined,
														}));
													}}
												>
													<Select.HiddenSelect />
													<Select.Control>
														<Select.Trigger>
															<Select.ValueText placeholder="Selecione uma categoria" />
														</Select.Trigger>

														<Select.IndicatorGroup>
															<Select.Indicator />
														</Select.IndicatorGroup>
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
											</Table.Cell>
											<Table.Cell>
												<Field.Root>
													<Input
														value={editingFormData.description}
														onChange={(e) =>
															setEditingFormData((prev) => ({
																...prev,
																description: e.target.value,
															}))
														}
														placeholder="Descrição"
													/>
												</Field.Root>
											</Table.Cell>
											<Table.Cell>
												<Input
													value={editingFormData.url}
													onChange={(e) =>
														setEditingFormData((prev) => ({ ...prev, url: e.target.value }))
													}
													placeholder="URL"
												/>
											</Table.Cell>
											<Table.Cell>
												<Button
													colorPalette="green"
													onClick={handleUpdate}
													disabled={
														!editingFormData.description ||
														!editingFormData.url ||
														!editingFormData.type
													}
												>
													Salvar
												</Button>
											</Table.Cell>
										</>
									) : (
										<>
											<Table.Cell>{getContentTypeBadge(content.type)}</Table.Cell>
											<Table.Cell>{content.description}</Table.Cell>
											<Table.Cell>
												<Text
													maxW="6xl"
													overflow="hidden"
													textOverflow="ellipsis"
													whiteSpace="nowrap"
												>
													{content.url}
												</Text>
											</Table.Cell>
											<Table.Cell>
												<Flex gap={2} justifyContent="flex-end">
													<Button
														size="sm"
														colorPalette="blue"
														onClick={() => setEditingFormData(content)}
													>
														Editar
													</Button>
													<Button
														size="sm"
														colorPalette="red"
														onClick={() => openDeleteDialog(content.id)}
													>
														Excluir
													</Button>
												</Flex>
											</Table.Cell>
										</>
									)}
								</Table.Row>
							))}
							<Table.Row>
								<Table.Cell>
									<Select.Root
										collection={selectOptions}
										value={formData.type ? [formData.type] : undefined}
										onValueChange={(e) => {
											setFormData((prev) => ({
												...prev,
												type: e.value[0] as
													| "document"
													| "video"
													| "blog"
													| "image"
													| "website"
													| undefined,
											}));
										}}
									>
										<Select.HiddenSelect />
										<Select.Control>
											<Select.Trigger>
												<Select.ValueText placeholder="Selecione uma categoria" />
											</Select.Trigger>

											<Select.IndicatorGroup>
												<Select.Indicator />
											</Select.IndicatorGroup>
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
								</Table.Cell>
								<Table.Cell>
									<Field.Root>
										<Input
											value={formData.description}
											onChange={(e) =>
												setFormData((prev) => ({ ...prev, description: e.target.value }))
											}
											placeholder="Descrição"
										/>
									</Field.Root>
								</Table.Cell>
								<Table.Cell>
									<Input
										value={formData.url}
										onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
										placeholder="URL"
									/>
								</Table.Cell>
								<Table.Cell>
									<Button
										colorPalette="green"
										onClick={handleCreate}
										disabled={!formData.description || !formData.url || !formData.type}
										loading={creating}
									>
										Adicionar
									</Button>
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>
				</Table.ScrollArea>
			)}

			<Dialog.Root
				open={openDelete}
				onOpenChange={({ open: isOpen }) => {
					if (!isOpen) {
						closeDeleteDialog();
					}
				}}
			>
				<Dialog.Backdrop />
				<Dialog.CloseTrigger />

				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Excluir Conteúdo</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>Você tem certeza? Essa ação não poderá ser desfeita.</Dialog.Body>
						<Dialog.Footer>
							<Button variant="subtle" onClick={closeDeleteDialog}>
								Cancelar
							</Button>
							<Button colorPalette="red" loading={isDeleting} onClick={handleConfirmDelete}>
								Excluir
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</VStack>
	);
};
