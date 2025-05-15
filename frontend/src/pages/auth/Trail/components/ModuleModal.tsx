import {
	Dialog,
	Button,
	Spinner,
	Box,
	Text,
	VStack,
	Link,
	HStack,
	Tag,
	Select,
	createListCollection,
	Flex,
} from "@chakra-ui/react";
import { HttpClient } from "lib/httpClient";
import { useEffect, useMemo, useState } from "react";
import { Module, ModuleContentType } from "types/module";

type ModuleDialogProps = {
	open: boolean;
	onClose: () => void;
	moduleId?: string;
	onChangeStatus: () => void;
};

export function ModuleDialog({ open, onClose, moduleId, onChangeStatus }: ModuleDialogProps) {
	const [moduleData, setModuleData] = useState<Module | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedOption, setSelectedOption] = useState("pendente");
	const [loadingStatus, setLoadingStatus] = useState(false);

	useEffect(() => {
		if (!open || !moduleId) return;

		setLoading(true);
		setError("");
		setModuleData(null);

		HttpClient.get<Module>(`/modules/${moduleId}/trail-data`)
			.then((res) => setModuleData(res.data))
			.catch(() => setError("Erro ao carregar os dados do módulo."))
			.finally(() => setLoading(false));
	}, [open, moduleId]);

	useEffect(() => {
		if (moduleData) {
			setSelectedOption(moduleData.completed ? "concluido" : "pendente");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [moduleData?.completed]);

	const getTagLabel = (type: ModuleContentType) => {
		switch (type) {
			case ModuleContentType.DOCUMENT:
				return "DOCUMENTO";
			case ModuleContentType.BLOG:
			case ModuleContentType.WEBSITE:
				return "ARTIGO";
			case ModuleContentType.VIDEO:
				return "VÍDEO";
			case ModuleContentType.IMAGE:
				return "IMAGEM";
			default:
				return "OUTRO";
		}
	};

	const updateModuleStatus = (status: string) => {
		setLoadingStatus(true);
		HttpClient.patch<Module>(`/modules/${moduleId}/completion`, {
			isCompleted: status === "concluido",
		})
			.then((res) => setModuleData(res.data))
			.finally(() => {
				setLoadingStatus(false);
				onChangeStatus();
			});
	};

	const selectOptions = createListCollection({
		items: [
			{ label: "Pendente", value: "pendente" },
			{ label: "Concluído", value: "concluido" },
		],
	});

	const selectColor = useMemo(() => {
		if (selectedOption === "pendente") {
			return "blue";
		} else {
			return "green";
		}
	}, [selectedOption]);

	return (
		<Dialog.Root
			open={open}
			onOpenChange={({ open }) => {
				if (!open) {
					onClose();
				}
			}}
			size="xl"
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content borderRadius="xl" p={2}>
					<Dialog.Header justifyContent="space-between">
						<Text fontWeight="bold" fontSize="lg">
							{moduleData?.title || "Carregando..."}
						</Text>
						<Select.Root
							size="xs"
							collection={selectOptions}
							width="120px"
							value={[selectedOption]}
							onValueChange={(e) => {
								updateModuleStatus(e.value[0]);
							}}
							disabled={loadingStatus}
						>
							<Select.HiddenSelect />
							<Select.Control>
								<Select.Trigger
									borderColor={selectColor + ".700"}
									color={selectColor + ".700"}
									bgColor={selectColor + ".50"}
								>
									{loadingStatus ? (
										<Flex width="100%" justifyContent="center">
											<Spinner size="xs" />
										</Flex>
									) : (
										<Select.ValueText />
									)}
								</Select.Trigger>
								{!loadingStatus ? (
									<Select.IndicatorGroup>
										<Select.Indicator color={selectColor + ".700"} />
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
					</Dialog.Header>
					<Dialog.CloseTrigger />

					<Dialog.Body>
						{loading && (
							<Box textAlign="center" py={6}>
								<Spinner size="xl" />
							</Box>
						)}

						{!loading && error && (
							<Text color="red.500" fontSize="md">
								{error}
							</Text>
						)}

						{!loading && moduleData && (
							<>
								<Text mb={4} fontSize="md">
									{moduleData.description}
								</Text>
								{moduleData.contents.length ? (
									<Text fontWeight="semibold" mb={2}>
										Visite os seguintes recursos para saber mais:
									</Text>
								) : null}

								<Box borderBottom="1px" borderColor="gray.300" mb={4} />

								<VStack align="start" gap={3}>
									{moduleData.contents.map((content) => (
										<HStack key={content.id} gap={3}>
											<Tag.Root size="sm" colorScheme="gray">
												<Tag.Label>{getTagLabel(content.type)}</Tag.Label>
											</Tag.Root>
											<Link
												href={content.url}
												color="blue.600"
												fontWeight="medium"
												textDecor="underline"
											>
												{content.description}
											</Link>
										</HStack>
									))}
								</VStack>
							</>
						)}
					</Dialog.Body>
					<Dialog.Footer>
						<Button onClick={onClose} colorScheme="gray">
							Fechar
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
