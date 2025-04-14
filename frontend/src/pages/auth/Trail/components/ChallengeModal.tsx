import { Dialog, Button, Spinner, Box, Text, RadioGroup, Flex, Progress } from "@chakra-ui/react";
import { HttpClient } from "lib/httpClient";
import { useEffect, useMemo, useState } from "react";
import { ChallengeToDo } from "types/challenge";
import { Module } from "types/module";
import { Frown, PartyPopper } from "lucide-react";

type ResponseResult = {
	success: boolean;
	percentage: number;
	studySuggestions: Omit<Module, "contents" | "completed">[];
};

type ChallengeDialogProps = {
	open: boolean;
	onClose: () => void;
	challengeId?: string;
	onChangeStatus: () => void;
	setSelectedModuleId: (selectedModuleId: string) => void;
};

export function ChallengeDialog({
	open,
	onClose,
	challengeId,
	onChangeStatus,
	setSelectedModuleId,
}: ChallengeDialogProps) {
	const [challengeData, setChallengeData] = useState<ChallengeToDo | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [step, setStep] = useState(0);
	const [responses, setResponses] = useState<{ id: string; response: string }[]>([]);
	const [responseResult, setResponseResult] = useState<ResponseResult>();

	useEffect(() => {
		if (!open || !challengeId) return;

		setLoading(true);
		setError("");
		setChallengeData(null);
		setStep(0);
		setResponses([]);
		setResponseResult(undefined);

		HttpClient.get<ChallengeToDo>(`/challenges/${challengeId}/respond`)
			.then((res) => setChallengeData(res.data))
			.catch(() => setError("Erro ao carregar os dados do desafio."))
			.finally(() => setLoading(false));
	}, [open, challengeId]);

	const currentResponse = useMemo(() => {
		return responses.find((r) => r.id === challengeData?.questions[step].id);
	}, [step, responses, challengeData?.questions]);

	const handleSubmit = () => {
		if (step < (challengeData?.questions?.length || 0) - 1 && currentResponse) {
			setStep((prevStep) => prevStep + 1);
		}
		if (step === (challengeData?.questions?.length || 0) - 1 && currentResponse) {
			setLoading(true);
			setError("");
			HttpClient.post<ResponseResult>(`/challenges/${challengeId}/respond`, { responses })
				.then((res) => setResponseResult(res.data))
				.catch(() => setError("Erro ao validar respostas do desafio."))
				.finally(() => {
					setLoading(false);
					onChangeStatus?.();
				});
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
					{!loading && challengeData && !responseResult && (
						<Dialog.Header justifyContent="space-between">
							<Text fontWeight="bold" fontSize="lg">
								Desafio
							</Text>
						</Dialog.Header>
					)}
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

						{!loading && challengeData && challengeData.questions.length > 0 && !responseResult && (
							<>
								<Text mb={4} fontSize="md">
									{challengeData.questions[step].question}
								</Text>

								<RadioGroup.Root>
									<RadioGroup.Root
										value={currentResponse?.response}
										onValueChange={(e) =>
											setResponses((prevRes) => {
												if (currentResponse) {
													return prevRes.map((pr) => {
														if (pr.id === challengeData.questions[step].id) {
															return { id: pr.id, response: e.value };
														} else {
															return pr;
														}
													});
												} else {
													return [
														...prevRes,
														{ id: challengeData.questions[step].id, response: e.value },
													];
												}
											})
										}
									>
										<Flex gap="6" flexDirection="column">
											{challengeData.questions[step].alternatives.map((alternative) => (
												<RadioGroup.Item key={alternative.id} value={alternative.id}>
													<RadioGroup.ItemHiddenInput />
													<RadioGroup.ItemIndicator />
													<RadioGroup.ItemText>{alternative.text}</RadioGroup.ItemText>
												</RadioGroup.Item>
											))}
										</Flex>
									</RadioGroup.Root>
								</RadioGroup.Root>
							</>
						)}
						{!loading &&
							responseResult &&
							(!responseResult.success ? (
								<Flex alignItems="center" justifyContent="center" flexDirection="column">
									<Frown width="150px" height="150px" />
									<Text fontSize="lg" mt="24px">
										Que pena!
									</Text>
									<Text fontSize="lg">Você não completou o desafio.</Text>
									<Text fontSize="lg">Não foi dessa vez mas será da próxima.</Text>
									{responseResult.studySuggestions.length > 0 ? (
										<>
											<Text fontSize="lg">Que tal revisar alguns conteúdos de:</Text>
											{responseResult.studySuggestions.map((suggestion) => (
												<Text
													fontSize="lg"
													fontWeight="bold"
													textDecoration="underline"
													cursor="pointer"
													mt="8px"
													key={suggestion.id}
													onClick={() => {
														onClose();
														setSelectedModuleId(suggestion.id);
													}}
												>
													{suggestion.title}
												</Text>
											))}
										</>
									) : null}
								</Flex>
							) : (
								<Flex alignItems="center" justifyContent="center" flexDirection="column">
									<PartyPopper width="150px" height="150px" />
									<Text fontSize="xl" fontWeight="bold" mt="24px" mb="16px">
										Parabéns!
									</Text>
									<Text fontSize="lg">Você completou o desafio com sucesso!</Text>
									<Text fontSize="lg">Seu esforço e dedicação são inspiradores.</Text>
								</Flex>
							))}
					</Dialog.Body>
					{!loading && challengeData && !responseResult && (
						<Dialog.Footer flexDirection="column">
							<Flex width="100%" justifyContent="space-between">
								<Button
									onClick={() => {
										setStep((prevStep) => (prevStep > 0 ? prevStep - 1 : 0));
									}}
									disabled={step <= 0}
									colorScheme="gray"
									variant="subtle"
								>
									Voltar
								</Button>
								<Button onClick={handleSubmit} disabled={!currentResponse} colorScheme="gray">
									Próximo
								</Button>
							</Flex>

							<Box width="100%">
								<Text textAlign="center">
									{step + 1} / {challengeData.questions.length}
								</Text>
								<Progress.Root min={0} max={challengeData?.questions.length} value={step} size="lg">
									<Progress.Track>
										<Progress.Range />
									</Progress.Track>
								</Progress.Root>
							</Box>
						</Dialog.Footer>
					)}
					{!loading && responseResult && (
						<Dialog.Footer>
							<Box width="100%">
								<Text textAlign="center" fontSize="xl" mb="8px">
									{responseResult.percentage}%
								</Text>
								<Progress.Root min={0} max={100} value={responseResult.percentage} size="lg">
									<Progress.Track>
										<Progress.Range />
									</Progress.Track>
								</Progress.Root>
							</Box>
						</Dialog.Footer>
					)}
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
