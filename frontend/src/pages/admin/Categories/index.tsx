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
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpClient } from "lib/httpClient";

import {
	monitorForElements,
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { flushSync } from "react-dom";
import { GripVertical, Lock } from "lucide-react";
import { Module } from "types/module";
import { Tooltip } from "components/ui/tooltip";
import { useTrail } from "contexts/TrailContext";

interface CategoryListItem {
	id: string;
	name: string;
	modules: Module[];
	challenge?: { id: string };
}

interface TrailListItem {
	id: string;
	name: string;
}
const DraggableRow = ({
	category,
	children,
}: PropsWithChildren<{ category: CategoryListItem }>) => {
	const rowRef = useRef<HTMLTableRowElement | null>(null);
	const cleanupRef = useRef<() => void>(() => {});

	useEffect(() => {
		const el = rowRef.current;
		if (!el) return;

		const cleanupDrag = draggable({
			element: el,
			getInitialData: () => ({ categoryId: category.id }),
		});
		const cleanupDrop = dropTargetForElements({
			element: el,
			getData: () => ({ categoryId: category.id }),
		});

		cleanupRef.current = () => {
			cleanupDrag();
			cleanupDrop();
		};

		return () => {
			cleanupRef.current?.();
		};
	}, [category.id]);

	return (
		<Table.Row bgColor="white" key={category.id} ref={rowRef} data-category-id={category.id}>
			{children}
		</Table.Row>
	);
};

export const AdminCategoriesPage = () => {
	const [categories, setCategories] = useState<CategoryListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [trails, setTrails] = useState<TrailListItem[]>([]);
	const [loadingTrails, setLoadingTrails] = useState(true);
	const { selectedTrailId, setSelectedTrailId } = useTrail();

	const navigate = useNavigate();

	const fetchCategories = async (selectedTrailId: string) => {
		try {
			const { data } = await HttpClient.get<CategoryListItem[]>(
				"/categories?trailId=" + selectedTrailId,
			);
			setCategories(data);
		} catch (e) {
			console.log("GET ALL TRAILS ERROR: ", e);
		} finally {
			setLoading(false);
		}
	};

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

	useEffect(() => {
		if (selectedTrailId) {
			fetchCategories(selectedTrailId);
		}
	}, [selectedTrailId]);

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
			await HttpClient.delete(`/categories/${deleteId}`);
			setCategories((prev) => prev.filter((category) => category.id !== deleteId));
		} catch (e) {
			console.log("DELETE TRAILS ERROR: ", e);
		} finally {
			setIsDeleting(false);
			closeDeleteDialog();
		}
	};

	useEffect(() => {
		if (!categories.length) return;

		const cleanup = monitorForElements({
			canMonitor({ source }) {
				return !!source.data && (source.data as { categoryId: string }).categoryId !== undefined;
			},
			onDrop({ source, location }) {
				const target = location.current.dropTargets[0];
				if (!target) return;

				const srcData = source.data as { categoryId: string };
				const tgtData = target.data as { categoryId: string };

				const srcIndex = categories.findIndex((c) => c.id === srcData.categoryId);
				const tgtIndex = categories.findIndex((c) => c.id === tgtData.categoryId);
				if (srcIndex < 0 || tgtIndex < 0) return;

				const edge = extractClosestEdge(tgtData);
				flushSync(() => {
					const reorder = reorderWithEdge({
						list: categories,
						startIndex: srcIndex,
						indexOfTarget: tgtIndex,
						closestEdgeOfTarget: edge,
						axis: "vertical",
					});
					setCategories(reorder);
					HttpClient.post("/categories/reorder", {
						trailId: selectedTrailId,
						categories: reorder.map((cat, index) => ({ id: cat.id, order: index + 1 })),
					}).catch(() => {
						fetchCategories(selectedTrailId!);
					});
				});
			},
		});

		return () => cleanup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categories]);

	const selectOptions = useMemo(() => {
		return createListCollection({
			items: trails.map((t) => ({ label: t.name, value: t.id })),
		});
	}, [trails]);

	if (loading && loadingTrails) {
		return (
			<VStack justify="center" style={{ width: `calc(100vw - 250px)`, height: "90vh" }}>
				<Spinner size="xl" />
			</VStack>
		);
	}

	return (
		<VStack align="stretch" p={6} style={{ width: `calc(100vw - 250px)`, minHeight: "90vh" }}>
			<HStack justify="space-between" mb={6}>
				<Text fontSize="2xl">Gerenciamento de categorias</Text>
				<Button colorPalette="green" onClick={() => navigate("/admin/categories/create")}>
					Criar nova categoria
				</Button>
			</HStack>
			<Select.Root
				size="lg"
				width="220px"
				collection={selectOptions}
				value={selectedTrailId ? [selectedTrailId] : undefined}
				onValueChange={(e) => {
					setSelectedTrailId(e.value[0]);
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

			{!categories.length ? (
				<EmptyState.Root>
					<EmptyState.Content>
						<VStack textAlign="center">
							<EmptyState.Title>Não há categorias aqui</EmptyState.Title>
							<EmptyState.Description>
								{selectedTrailId ? "Selecione outra trilha" : "Selecione uma trilha"}
							</EmptyState.Description>
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			) : (
				<Table.ScrollArea>
					<Table.Root variant="outline">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader width="40px"></Table.ColumnHeader>
								<Table.ColumnHeader>Nome</Table.ColumnHeader>
								<Table.ColumnHeader width="100px" textAlign="center">
									Qtde. de Módulos
								</Table.ColumnHeader>
								<Table.ColumnHeader width="100px" textAlign="end">
									Ações
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{categories.map((category) => (
								<DraggableRow category={category} key={category.id}>
									<Table.Cell>
										<GripVertical color="#e4e4e7" />
									</Table.Cell>
									<Table.Cell>
										<Flex alignItems="center" gap="8px">
											{category.name}
											{category.challenge ? (
												<Tooltip content="Esta categoria possui desafio">
													<Lock size="20px" color="gray" />
												</Tooltip>
											) : (
												""
											)}
										</Flex>
									</Table.Cell>
									<Table.Cell textAlign="center">{category.modules.length}</Table.Cell>
									<Table.Cell>
										<Flex gap={2} justifyContent="flex-end">
											<Button
												size="sm"
												colorPalette="blue"
												onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
											>
												Editar
											</Button>
											<Button
												size="sm"
												colorPalette="red"
												onClick={() => openDeleteDialog(category.id)}
											>
												Excluir
											</Button>
										</Flex>
									</Table.Cell>
								</DraggableRow>
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
							<Dialog.Title>Excluir Categoria</Dialog.Title>
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
