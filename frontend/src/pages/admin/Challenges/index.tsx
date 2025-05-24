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
import { HttpClient } from "lib/httpClient";
import { useTrail } from "contexts/TrailContext";
import { useNavigate } from "react-router-dom";

interface ChallengeListItem {
	id: string;
	category: {
		id: string;
		name: string;
		trail: {
			id: string;
			name: string;
		};
	};
	questions: { id: string; question: string }[];
}

interface TrailListItem {
	id: string;
	name: string;
}

export const AdminChallengesPage = () => {
	const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [trails, setTrails] = useState<TrailListItem[]>([]);
	const [loadingTrails, setLoadingTrails] = useState(true);
	const { selectedTrailId, setSelectedTrailId } = useTrail();
	const navigate = useNavigate();

	const fetchChallenges = async (selectedTrailId?: string | null) => {
		try {
			const url = selectedTrailId ? `/challenges?trailId=${selectedTrailId}` : "/challenges";
			const { data } = await HttpClient.get<ChallengeListItem[]>(url);
			setChallenges(data);
		} catch (e) {
			console.log("GET ALL CHALLENGES ERROR: ", e);
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
		fetchChallenges(selectedTrailId);
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
			await HttpClient.delete(`/challenges/${deleteId}`);
			setChallenges((prev) => prev.filter((challenge) => challenge.id !== deleteId));
		} catch (e) {
			console.log("DELETE CHALLENGE ERROR: ", e);
		} finally {
			setIsDeleting(false);
			closeDeleteDialog();
		}
	};

	const selectOptions = useMemo(() => {
		return createListCollection({
			items: [
				{ label: "Todas", value: "all" },
				...trails.map((t) => ({ label: t.name, value: t.id })),
			],
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
				<Text fontSize="2xl">Gerenciamento de desafios</Text>
				<Button colorPalette="green" onClick={() => navigate("/admin/challenges/create")}>
					Adicionar novo desafio
				</Button>
			</HStack>
			<Select.Root
				size="lg"
				width="220px"
				collection={selectOptions}
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
						{selectOptions.items.map((framework) => (
							<Select.Item item={framework} key={framework.value}>
								{framework.label}
								<Select.ItemIndicator />
							</Select.Item>
						))}
					</Select.Content>
				</Select.Positioner>
			</Select.Root>

			{!challenges.length ? (
				<EmptyState.Root>
					<EmptyState.Content>
						<VStack textAlign="center">
							<EmptyState.Title>Não há desafios aqui</EmptyState.Title>
							<EmptyState.Description>Selecione outra trilha</EmptyState.Description>
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			) : (
				<Table.ScrollArea>
					<Table.Root variant="outline">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader>Categoria</Table.ColumnHeader>
								<Table.ColumnHeader width="150px" textAlign="center">
									Qtde. Questões
								</Table.ColumnHeader>
								{selectedTrailId ? null : <Table.ColumnHeader>Trilha</Table.ColumnHeader>}
								<Table.ColumnHeader width="150px" textAlign="end">
									Ações
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{challenges.map((challenge) => (
								<Table.Row key={challenge.id}>
									<Table.Cell>{challenge.category.name}</Table.Cell>
									<Table.Cell textAlign="center">{challenge.questions.length}</Table.Cell>
									{selectedTrailId ? null : (
										<Table.Cell>{challenge.category.trail.name}</Table.Cell>
									)}
									<Table.Cell>
										<Flex gap={2} justifyContent="flex-end">
											<Button size="sm" colorPalette="blue">
												Questões
											</Button>
											<Button
												size="sm"
												colorPalette="red"
												onClick={() => openDeleteDialog(challenge.id)}
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
							<Dialog.Title>Excluir Desafio</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							Você tem certeza? Essa ação não poderá ser desfeita e as questões do desafio também
							serão excluídas.
						</Dialog.Body>
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
