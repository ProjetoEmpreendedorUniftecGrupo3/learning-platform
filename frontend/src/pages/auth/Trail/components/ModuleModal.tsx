import { Dialog, Button, Spinner, Box, Text, VStack, Link, HStack, Tag } from "@chakra-ui/react";
import { HttpClient } from "lib/httpClient";
import { useEffect, useState } from "react";
import { Module, ModuleContentType } from "types/module";

type ModuleDialogProps = {
	open: boolean;
	onClose: () => void;
	moduleId?: string;
};

export function ModuleDialog({ open, onClose, moduleId }: ModuleDialogProps) {
	const [moduleData, setModuleData] = useState<Module | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!open || !moduleId) return;

		setLoading(true);
		setError("");
		setModuleData(null);

		HttpClient.get<Module>(`/modules/${moduleId}`)
			.then((res) => setModuleData(res.data))
			.catch(() => setError("Erro ao carregar os dados do módulo."))
			.finally(() => setLoading(false));
	}, [open, moduleId]);

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
					<Dialog.Header fontWeight="bold" fontSize="lg">
						{moduleData?.title || "Carregando..."}
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
