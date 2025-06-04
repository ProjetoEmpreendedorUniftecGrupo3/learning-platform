import {
	VStack,
	Text,
	Spinner,
	Button,
	HStack,
	Dialog,
	Field,
	Input,
	Select,
	createListCollection,
	Textarea,
	Box,
	IconButton,
	Badge,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HttpClient } from "lib/httpClient";
import { toaster } from "components/ui/toaster";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface QuestionAlternative {
	id?: string;
	text: string;
	isCorrect: boolean;
}

interface ChallengeQuestionItem {
	id: string;
	question: string;
	alternatives: QuestionAlternative[];
	courseModule?: {
		id: string;
		title: string;
	};
}

interface Challenge {
	id: string;
	category: {
		id: string;
		name: string;
	};
	questions: ChallengeQuestionItem[];
}

interface ModuleListItem {
	id: string;
	title: string;
}

interface ChallengeQuestionFormData {
	question: string;
	moduleId?: string | null;
	alternatives: QuestionAlternative[];
}

export const ChallengeQuestionsPage = () => {
	const { challengeId } = useParams();
	const navigate = useNavigate();
	const [questions, setQuestions] = useState<ChallengeQuestionItem[]>([]);
	const [challenge, setChallenge] = useState<Challenge | null>(null);
	const [modules, setModules] = useState<ModuleListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [creating, setCreating] = useState(false);

	const [formData, setFormData] = useState<ChallengeQuestionFormData>({
		question: "",
		moduleId: null,
		alternatives: [
			{ text: "", isCorrect: false },
			{ text: "", isCorrect: false },
		],
	});

	const [editingFormData, setEditingFormData] = useState<
		ChallengeQuestionFormData & { id: string }
	>({
		question: "",
		moduleId: null,
		alternatives: [],
		id: "",
	});

	const fetchChallenge = async () => {
		try {
			const { data } = await HttpClient.get<Challenge>(`/challenges/${challengeId}`);
			setChallenge(data);
			setQuestions(data.questions || []);

			// Buscar módulos da mesma categoria do desafio
			const { data: modulesData } = await HttpClient.get<ModuleListItem[]>(
				`/modules?categoryId=${data.category.id}`,
			);
			setModules(modulesData);
		} catch (e) {
			console.error("GET CHALLENGE ERROR:", e);
			navigate("/admin/challenges");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (challengeId) {
			fetchChallenge();
		} else {
			navigate("/admin/challenges");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [challengeId]);

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
			await HttpClient.delete(`/challenge-questions/${deleteId}`);
			setQuestions((prev) => prev.filter((question) => question.id !== deleteId));
			toaster.create({
				title: "Sucesso",
				description: "Questão excluída com sucesso",
				type: "success",
			});
		} catch (e) {
			console.error("DELETE CHALLENGE QUESTION ERROR:", e);
		} finally {
			setIsDeleting(false);
			closeDeleteDialog();
		}
	};

	const moduleSelectOptions = useMemo(() => {
		return createListCollection({
			items: [
				{ label: "Nenhum módulo", value: "" },
				...modules.map((m) => ({ label: m.title, value: m.id })),
			],
		});
	}, [modules]);

	const handleUpdate = async () => {
		try {
			const { data } = await HttpClient.put<ChallengeQuestionItem>(
				`/challenge-questions/${editingFormData.id}`,
				{
					question: editingFormData.question,
					moduleId: editingFormData.moduleId || null,
					alternatives: editingFormData.alternatives.map((a) => ({
						text: a.text,
						isCorrect: a.isCorrect,
					})),
				},
			);

			setQuestions((prev) => prev.map((item) => (item.id === editingFormData.id ? data : item)));

			toaster.create({
				title: "Sucesso",
				description: "Questão atualizada com sucesso",
				type: "success",
			});

			setEditingFormData({
				question: "",
				moduleId: undefined,
				alternatives: [],
				id: "",
			});
		} catch (e) {
			console.error("UPDATE CHALLENGE QUESTION ERROR:", e);
			fetchChallenge();
		}
	};

	const handleCreate = async () => {
		try {
			setCreating(true);
			const { data } = await HttpClient.post<ChallengeQuestionItem>(`/challenge-questions`, {
				question: formData.question,
				moduleId: formData.moduleId || null,
				challengeId: challengeId,
				alternatives: formData.alternatives,
			});

			setQuestions((prev) => [...prev, data]);

			toaster.create({
				title: "Sucesso",
				description: "Questão adicionada com sucesso",
				type: "success",
			});

			setFormData({
				question: "",
				moduleId: undefined,
				alternatives: [
					{ text: "", isCorrect: false },
					{ text: "", isCorrect: false },
				],
			});
			setCreating(false);
		} catch (e) {
			console.error("CREATE CHALLENGE QUESTION ERROR:", e);
			fetchChallenge();
		}
	};

	const addAlternative = (isEditing: boolean) => {
		if (isEditing) {
			setEditingFormData((prev) => ({
				...prev,
				alternatives: [...prev.alternatives, { text: "", isCorrect: false }],
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				alternatives: [...prev.alternatives, { text: "", isCorrect: false }],
			}));
		}
	};

	const removeAlternative = (index: number, isEditing: boolean) => {
		if (isEditing) {
			setEditingFormData((prev) => ({
				...prev,
				alternatives: prev.alternatives.filter((_, i) => i !== index),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				alternatives: prev.alternatives.filter((_, i) => i !== index),
			}));
		}
	};

	const updateAlternative = (
		index: number,
		field: "text" | "isCorrect",
		value: string | boolean,
		isEditing: boolean,
	) => {
		if (isEditing) {
			setEditingFormData((prev) => ({
				...prev,
				alternatives: prev.alternatives.map((alt, i) =>
					i === index ? { ...alt, [field]: value } : alt,
				),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				alternatives: prev.alternatives.map((alt, i) =>
					i === index ? { ...alt, [field]: value } : alt,
				),
			}));
		}
	};

	const setCorrectAlternative = (index: number, isEditing: boolean) => {
		if (isEditing) {
			setEditingFormData((prev) => ({
				...prev,
				alternatives: prev.alternatives.map((alt, i) => ({
					...alt,
					isCorrect: i === index,
				})),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				alternatives: prev.alternatives.map((alt, i) => ({
					...alt,
					isCorrect: i === index,
				})),
			}));
		}
	};

	const isFormValid = (data: ChallengeQuestionFormData) => {
		return (
			data.question.trim() !== "" &&
			data.alternatives.length >= 2 &&
			data.alternatives.every((alt) => alt.text.trim() !== "") &&
			data.alternatives.some((alt) => alt.isCorrect)
		);
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
			<Button
				alignSelf="flex-start"
				colorPalette="red"
				onClick={() => navigate("/admin/challenges")}
			>
				<ArrowLeft />
				Voltar
			</Button>
			<HStack justify="space-between" mt={2}>
				<VStack align="start" gap={1}>
					{challenge && (
						<>
							<Text fontSize="2xl">Categoria: {challenge.category.name}</Text>
							<Text fontSize="lg" fontWeight="bold">
								Questões do Desafio:
							</Text>
						</>
					)}
				</VStack>
			</HStack>

			<VStack align="stretch" gap={6}>
				{/* Lista de questões existentes */}
				{questions.map((question) => (
					<Box key={question.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
						{editingFormData.id === question.id ? (
							// Formulário de edição
							<VStack align="stretch" gap={4}>
								<Field.Root>
									<Field.Label>Pergunta</Field.Label>
									<Textarea
										value={editingFormData.question}
										onChange={(e) =>
											setEditingFormData((prev) => ({ ...prev, question: e.target.value }))
										}
										placeholder="Digite a pergunta"
									/>
								</Field.Root>

								<Field.Root>
									<Field.Label>Módulo Associado (Opcional)</Field.Label>
									<Select.Root
										collection={moduleSelectOptions}
										value={editingFormData.moduleId ? [editingFormData.moduleId] : [""]}
										onValueChange={(e) => {
											setEditingFormData((prev) => ({
												...prev,
												moduleId: e.value[0] || null,
											}));
										}}
									>
										<Select.HiddenSelect />
										<Select.Control>
											<Select.Trigger>
												<Select.ValueText placeholder="Nenhum módulo" />
											</Select.Trigger>
											<Select.IndicatorGroup>
												<Select.Indicator />
											</Select.IndicatorGroup>
										</Select.Control>
										<Select.Positioner>
											<Select.Content>
												{moduleSelectOptions.items.map((module) => (
													<Select.Item item={module} key={module.value}>
														{module.label}
														<Select.ItemIndicator />
													</Select.Item>
												))}
											</Select.Content>
										</Select.Positioner>
									</Select.Root>
								</Field.Root>

								<Field.Root>
									<Field.Label>Alternativas</Field.Label>
									<VStack align="stretch" gap={2}>
										{editingFormData.alternatives.map((alternative, index) => (
											<HStack key={index} gap={2}>
												<Input
													flex={1}
													value={alternative.text}
													onChange={(e) => updateAlternative(index, "text", e.target.value, true)}
													placeholder={`Alternativa ${index + 1}`}
												/>
												<Button
													colorPalette={alternative.isCorrect ? "green" : "gray"}
													onClick={() => setCorrectAlternative(index, true)}
													size="sm"
												>
													{alternative.isCorrect ? "Correta" : "Marcar como correta"}
												</Button>
												{editingFormData.alternatives.length > 2 && (
													<IconButton
														colorPalette="red"
														onClick={() => removeAlternative(index, true)}
														size="sm"
													>
														<Trash2 />
													</IconButton>
												)}
											</HStack>
										))}
										<Button
											variant="outline"
											onClick={() => addAlternative(true)}
											size="sm"
											alignSelf="flex-start"
										>
											<Plus />
											Adicionar Alternativa
										</Button>
									</VStack>
								</Field.Root>

								<HStack gap={2}>
									<Button
										colorPalette="green"
										onClick={handleUpdate}
										disabled={!isFormValid(editingFormData)}
									>
										Salvar
									</Button>
									<Button
										variant="outline"
										onClick={() =>
											setEditingFormData({
												question: "",
												moduleId: undefined,
												alternatives: [],
												id: "",
											})
										}
									>
										Cancelar
									</Button>
								</HStack>
							</VStack>
						) : (
							// Visualização da questão
							<VStack align="stretch" gap={3}>
								<HStack justify="space-between">
									<Text fontSize="lg" fontWeight="bold">
										{question.question}
									</Text>
									<HStack gap={2}>
										<Button
											size="sm"
											colorPalette="blue"
											onClick={() =>
												setEditingFormData({
													question: question.question,
													moduleId: question.courseModule?.id,
													alternatives: question.alternatives,
													id: question.id,
												})
											}
										>
											Editar
										</Button>
										<Button
											size="sm"
											colorPalette="red"
											onClick={() => openDeleteDialog(question.id)}
										>
											Excluir
										</Button>
									</HStack>
								</HStack>

								{question.courseModule && (
									<Badge colorPalette="blue" alignSelf="flex-start">
										Módulo: {question.courseModule.title}
									</Badge>
								)}

								<VStack align="stretch" gap={1}>
									{question.alternatives.map((alternative, index) => (
										<HStack key={alternative.id || index} gap={2}>
											<Text color={alternative.isCorrect ? "green" : "gray"}>
												{alternative.text}
											</Text>
											{alternative.isCorrect && <Badge colorPalette="green">Correta</Badge>}
										</HStack>
									))}
								</VStack>
							</VStack>
						)}
					</Box>
				))}

				{/* Formulário para criar nova questão */}
				<Box p={4} border="1px solid" borderColor="gray.300" borderRadius="md" bg="gray.50">
					<Text fontSize="lg" fontWeight="bold" mb={4}>
						Adicionar Nova Questão
					</Text>
					<VStack align="stretch" gap={4}>
						<Field.Root>
							<Field.Label>Pergunta</Field.Label>
							<Textarea
								value={formData.question}
								onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
								placeholder="Digite a pergunta"
							/>
						</Field.Root>

						<Field.Root>
							<Field.Label>Módulo Associado (Opcional)</Field.Label>
							<Select.Root
								collection={moduleSelectOptions}
								value={formData.moduleId ? [formData.moduleId] : [""]}
								onValueChange={(e) => {
									setFormData((prev) => ({ ...prev, moduleId: e.value[0] || null }));
								}}
							>
								<Select.HiddenSelect />
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Nenhum módulo" />
									</Select.Trigger>
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								</Select.Control>
								<Select.Positioner>
									<Select.Content>
										{moduleSelectOptions.items.map((module) => (
											<Select.Item item={module} key={module.value}>
												{module.label}
												<Select.ItemIndicator />
											</Select.Item>
										))}
									</Select.Content>
								</Select.Positioner>
							</Select.Root>
						</Field.Root>

						<Field.Root>
							<Field.Label>Alternativas</Field.Label>
							<VStack align="stretch" gap={2}>
								{formData.alternatives.map((alternative, index) => (
									<HStack key={index} gap={2}>
										<Input
											flex={1}
											value={alternative.text}
											onChange={(e) => updateAlternative(index, "text", e.target.value, false)}
											placeholder={`Alternativa ${index + 1}`}
										/>
										<Button
											colorPalette={alternative.isCorrect ? "green" : "gray"}
											onClick={() => setCorrectAlternative(index, false)}
											size="sm"
										>
											{alternative.isCorrect ? "Correta" : "Marcar como correta"}
										</Button>
										{formData.alternatives.length > 2 && (
											<IconButton
												colorPalette="red"
												onClick={() => removeAlternative(index, false)}
												size="sm"
											>
												<Trash2 />
											</IconButton>
										)}
									</HStack>
								))}
								<Button
									variant="outline"
									onClick={() => addAlternative(false)}
									size="sm"
									alignSelf="flex-start"
								>
									<Plus />
									Adicionar Alternativa
								</Button>
							</VStack>
						</Field.Root>

						<Button
							colorPalette="green"
							onClick={handleCreate}
							disabled={!isFormValid(formData)}
							loading={creating}
							alignSelf="flex-start"
						>
							Adicionar Questão
						</Button>
					</VStack>
				</Box>
			</VStack>

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
							<Dialog.Title>Excluir Questão</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							Você tem certeza? Essa ação não poderá ser desfeita e todas as alternativas da questão
							também serão excluídas.
						</Dialog.Body>
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
