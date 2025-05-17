import {
	VStack,
	Text,
	Spinner,
	Button,
	HStack,
	Table,
	Dialog,
	CloseButton,
	Flex,
	Select,
	createListCollection,
	EmptyState,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpClient } from "lib/httpClient";

import { ModuleContent } from "types/module";
import { usePersistedState } from "hooks/usePersistedState";

interface ModuleListItem {
	id: string;
	title: string;
	description: string;
	contents: ModuleContent[];
}

interface CategoryListItem {
	id: string;
	name: string;
}

export const AdminModulesPage = () => {
	const [modules, setModules] = useState<ModuleListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [categories, setCategories] = useState<CategoryListItem[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [selectedCategoryId, setSelectedCategoryId] = usePersistedState<string | null>(
		"selectedCategoryId",
		null,
	);

	const navigate = useNavigate();

	const fetchModules = async (selectedCategoryId: string) => {
		try {
			const { data } = await HttpClient.get<ModuleListItem[]>(
				"/modules?categoryId=" + selectedCategoryId,
			);
			setModules(data);
		} catch (e) {
			console.log("GET ALL MODULES ERROR: ", e);
		} finally {
			setLoading(false);
		}
	};

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

	useEffect(() => {
		if (selectedCategoryId) {
			fetchModules(selectedCategoryId);
		}
	}, [selectedCategoryId]);

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
			await HttpClient.delete(`/modules/${deleteId}`);
			setModules((prev) => prev.filter((courseModule) => courseModule.id !== deleteId));
		} catch (e) {
			console.log("DELETE MODULE ERROR: ", e);
		} finally {
			setIsDeleting(false);
			closeDeleteDialog();
		}
	};

	const selectOptions = useMemo(() => {
		return createListCollection({
			items: categories.map((t) => ({ label: t.name, value: t.id })),
		});
	}, [categories]);

	if (loading && loadingCategories) {
		return (
			<VStack justify="center" style={{ width: `calc(100vw - 250px)`, height: "90vh" }}>
				<Spinner size="xl" />
			</VStack>
		);
	}

	return (
		<VStack align="stretch" p={6} style={{ width: `calc(100vw - 250px)`, minHeight: "90vh" }}>
			<HStack justify="space-between" mb={6}>
				<Text fontSize="2xl">Gerenciamento de módulos</Text>
				<Button colorPalette="green" onClick={() => navigate("/admin/modules/create")}>
					Criar novo módulo
				</Button>
			</HStack>
			<Select.Root
				size="lg"
				width="220px"
				collection={selectOptions}
				value={selectedCategoryId ? [selectedCategoryId] : undefined}
				onValueChange={(e) => {
					setSelectedCategoryId(e.value[0]);
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
						{selectOptions.items.map((framework) => (
							<Select.Item item={framework} key={framework.value}>
								{framework.label}
								<Select.ItemIndicator />
							</Select.Item>
						))}
					</Select.Content>
				</Select.Positioner>
			</Select.Root>

			{!modules.length ? (
				<EmptyState.Root>
					<EmptyState.Content>
						<VStack textAlign="center">
							<EmptyState.Title>Não há módulos aqui</EmptyState.Title>
							<EmptyState.Description>
								{selectedCategoryId ? "Selecione outra categoria" : "Selecione uma categoria"}
							</EmptyState.Description>
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			) : (
				<Table.ScrollArea>
					<Table.Root variant="outline">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader>Título</Table.ColumnHeader>
								<Table.ColumnHeader>Descrição</Table.ColumnHeader>
								<Table.ColumnHeader width="100px" textAlign="center">
									Qtde. de conteúdos
								</Table.ColumnHeader>
								<Table.ColumnHeader width="100px" textAlign="end">
									Ações
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{modules.map((courseModule) => (
								<Table.Row key={courseModule.id}>
									<Table.Cell>{courseModule.title}</Table.Cell>
									<Table.Cell
										maxW="6xl"
										overflow="hidden"
										textOverflow="ellipsis"
										whiteSpace="nowrap"
									>
										{courseModule.description}
									</Table.Cell>
									<Table.Cell textAlign="center">{courseModule.contents.length}</Table.Cell>
									<Table.Cell>
										<Flex gap={2} justifyContent="flex-end">
											<Button
												size="sm"
												colorPalette="blue"
												onClick={() => navigate(`/admin/modules/edit/${courseModule.id}`)}
											>
												Editar
											</Button>
											<Button
												size="sm"
												colorPalette="red"
												onClick={() => openDeleteDialog(courseModule.id)}
											>
												Excluir
											</Button>
										</Flex>
									</Table.Cell>
								</Table.Row>
							))}
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
							<Dialog.Title>Excluir Módulo</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>Você tem certeza? Essa ação não poderá ser desfeita.</Dialog.Body>
						<Dialog.Footer>
							<Button variant="subtle" onClick={closeDeleteDialog}>
								Cancelar
							</Button>

							<Button colorPalette="red" onClick={handleConfirmDelete} loading={isDeleting}>
								Excluir
							</Button>
						</Dialog.Footer>
						<Dialog.CloseTrigger asChild>
							<CloseButton />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</VStack>
	);
};
