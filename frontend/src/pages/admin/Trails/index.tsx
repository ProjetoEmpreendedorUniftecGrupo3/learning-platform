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
	EmptyState,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpClient } from "lib/httpClient";

interface TrailListItem {
	id: string;
	name: string;
}

export const AdminTrailsPage = () => {
	const [trails, setTrails] = useState<TrailListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const navigate = useNavigate();

	const fetchTrails = async () => {
		try {
			const { data } = await HttpClient.get<TrailListItem[]>("/trails");
			setTrails(data);
		} catch (e) {
			console.log("GET ALL TRAILS ERROR: ", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTrails();
	}, []);

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
			await HttpClient.delete(`/trails/${deleteId}`);
			setTrails((prev) => prev.filter((trail) => trail.id !== deleteId));
		} catch (e) {
			console.log("DELETE TRAILS ERROR: ", e);
		} finally {
			setIsDeleting(false);
			closeDeleteDialog();
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
			<HStack justify="space-between" mb={6}>
				<Text fontSize="2xl">Gerenciamento de trilhas</Text>
				<Button colorPalette="green" onClick={() => navigate("/admin/trails/create")}>
					Criar nova trilha
				</Button>
			</HStack>
			{!trails.length ? (
				<EmptyState.Root>
					<EmptyState.Content>
						<VStack textAlign="center">
							<EmptyState.Title>Não há trilhas aqui</EmptyState.Title>
							<EmptyState.Description>Começe criando uma nova trilha</EmptyState.Description>
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			) : (
				<Table.ScrollArea>
					<Table.Root variant="outline">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader>Nome</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{trails.map((trail) => (
								<Table.Row key={trail.id}>
									<Table.Cell>{trail.name}</Table.Cell>
									<Table.Cell>
										<Flex gap={2} justifyContent="flex-end">
											<Button
												size="sm"
												colorPalette="blue"
												onClick={() => navigate(`/admin/trails/edit/${trail.id}`)}
											>
												Editar
											</Button>
											<Button
												size="sm"
												colorPalette="red"
												onClick={() => openDeleteDialog(trail.id)}
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
							<Dialog.Title>Excluir Trilha</Dialog.Title>
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
