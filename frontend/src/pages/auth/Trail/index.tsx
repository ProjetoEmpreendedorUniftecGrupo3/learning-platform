import { Box, Text, Flex, Spinner, Center, Progress } from "@chakra-ui/react";
import { Category, CategoryModule, Trail } from "types/trail";
import { LockOpen, Lock, Check } from "lucide-react";
import { HttpClient } from "lib/httpClient";
import { useEffect, useState } from "react";
import { useTrail } from "contexts/UserContext";
import ScrollContainer from "react-indiana-drag-scroll";
import "react-indiana-drag-scroll/dist/style.css";
import { ModuleDialog } from "./components/ModuleModal";

const lineColor = "gray";

const SCREEN_PADDING = 96;
const LINES_SIZE = 4;
const TRAIL_HEIGHT = 80;
const TRAIL_WIDTH = 300;
const CATEGORY_HEIGHT = 60;
const CATEGORY_WIDTH = 200;
const CATEGORY_MARGIN = 60;
const CATEGORY_MODULE_GAP = 100;
const MODULE_HEIGHT = 50;
const MODULE_GAP = 32;
const FIRST_MODULE_MARGIN = (CATEGORY_HEIGHT - MODULE_HEIGHT) / 2;
const CHALLENGE_SIZE = 80;
const CHALLENGE_CONTAINER_WIDTH = 90;
const CHALLENGE_CONTAINER_GAP = 0;

interface ModuleNodeProps extends CategoryModule {
	index: number;
	blocked: boolean;
	onClick: () => void;
}

const ModuleNode = ({ id, title, index, completed, blocked, onClick }: ModuleNodeProps) => {
	return (
		<Box
			key={id}
			position="relative"
			mt={index > 0 ? MODULE_GAP + "px" : FIRST_MODULE_MARGIN + "px"}
			onClick={!blocked ? onClick : undefined}
			cursor={!blocked ? "pointer" : "drag"}
		>
			{/* Linha que conecta o nó ao seu "pai" (exceto se for nível 0) */}
			<Box
				position="absolute"
				top={MODULE_HEIGHT / 2 + "px"}
				left={-(CATEGORY_MODULE_GAP - (index > 0 ? CATEGORY_MODULE_GAP / 3 : 0)) + "px"}
				borderTop={LINES_SIZE + "px solid"}
				borderColor={lineColor}
				width={CATEGORY_MODULE_GAP - (index > 0 ? CATEGORY_MODULE_GAP / 3 : 0) + "px"}
				transform="translateY(-50%)"
			/>
			{index > 0 && (
				<Box
					position="absolute"
					top={-(MODULE_GAP + MODULE_HEIGHT / 2) + LINES_SIZE / 2 + "px"}
					left={-(CATEGORY_MODULE_GAP - CATEGORY_MODULE_GAP / 3) + "px"}
					borderLeft={LINES_SIZE + "px solid"}
					borderColor={lineColor}
					height={MODULE_GAP + MODULE_HEIGHT + "px"}
					transform="translateX(-50%)"
				/>
			)}

			{/* Conteúdo do nó */}
			<Flex
				align="center"
				border="1px solid"
				borderColor={completed ? "green.500" : lineColor}
				borderRadius="full"
				px="16px"
				py="4px"
				bg={completed ? "green.50" : "white"}
				fontWeight="medium"
				position="relative"
				w="fit-content"
				h={MODULE_HEIGHT + "px"}
				alignItems="center"
				justifyContent="center"
				boxShadow="sm"
			>
				{completed && <Check size={16} color="green" style={{ marginRight: 4 }} />}
				<Text whiteSpace="nowrap">{title}</Text>
				{blocked && (
					<Box
						position="absolute"
						top="0"
						left="0"
						w="100%"
						h="100%"
						bg="rgba(0,0,0,0.5)"
						borderRadius="full"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<Lock color="white" />
					</Box>
				)}
			</Flex>
		</Box>
	);
};

interface CategoryNodeProps extends Category {
	index: number;
	lastCategory: Category | undefined;
	setSelectedModuleId: (moduleId: string) => void;
}

const CategoryNode = ({
	id,
	name,
	modules,
	challenge,
	blocked,
	index,
	lastCategory,
	setSelectedModuleId,
}: CategoryNodeProps) => {
	const lastCategoryHeight =
		index > 0 && lastCategory
			? MODULE_HEIGHT +
				FIRST_MODULE_MARGIN +
				(lastCategory.modules.length - 1) * (MODULE_HEIGHT + MODULE_GAP) -
				CATEGORY_HEIGHT
			: 0;

	const completedModulesLength = modules.filter((m) => m.completed).length;
	const categoryCompleted = completedModulesLength === modules.length && modules.length > 0;

	return (
		<Flex
			key={id}
			position="relative"
			mt={CATEGORY_MARGIN + "px"}
			ml={index > 0 ? CATEGORY_WIDTH * 2 * index : 0}
		>
			{/* Conexões se não for a primeira categoria */}
			{index > 0 && (
				<>
					<Box
						position="absolute"
						top={-(CATEGORY_MARGIN + (lastCategoryHeight > 0 ? lastCategoryHeight : 0)) + "px"}
						left={-(CATEGORY_WIDTH * 2 - CATEGORY_WIDTH / 2) + "px"}
						borderLeft={LINES_SIZE + "px solid"}
						borderColor={lineColor}
						height={
							CATEGORY_MARGIN +
							CATEGORY_HEIGHT / 2 +
							(lastCategoryHeight > 0 ? lastCategoryHeight : 0) +
							"px"
						}
						transform="translateX(-50%)"
					/>
					<Box
						position="absolute"
						top={CATEGORY_HEIGHT / 2 + "px"}
						left={-(CATEGORY_WIDTH * 2 - CATEGORY_WIDTH / 2 + LINES_SIZE / 2) + "px"}
						borderTop={LINES_SIZE + "px solid"}
						borderColor={lineColor}
						width={CATEGORY_WIDTH * 2 - CATEGORY_WIDTH / 2 + LINES_SIZE / 2 + "px"}
						transform="translateY(-50%)"
					/>
				</>
			)}

			{/* Conteúdo do nó */}
			<Flex
				align="center"
				border="1px solid"
				borderRadius="full"
				fontWeight="medium"
				position="relative"
				w={CATEGORY_WIDTH + "px"}
				h={CATEGORY_HEIGHT + "px"}
				alignItems="center"
				justifyContent="center"
				px="16px"
				py="4px"
				boxShadow="sm"
				borderColor={categoryCompleted ? "green.500" : lineColor}
				bg={categoryCompleted ? "green.50" : "white"}
			>
				<Box width="100%" mx="24px">
					<Text textAlign="center" whiteSpace="nowrap" mb="4px">
						{name}
					</Text>
					<Progress.Root
						min={0}
						max={modules.length || 1}
						value={completedModulesLength}
						variant="subtle"
						size="xs"
						colorPalette={categoryCompleted ? "green" : undefined}
					>
						<Progress.Track>
							<Progress.Range />
						</Progress.Track>
					</Progress.Root>
				</Box>
				{blocked && (
					<Box
						position="absolute"
						top="0"
						left="0"
						w="100%"
						h="100%"
						bg="rgba(0,0,0,0.5)"
						borderRadius="full"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<Lock color="white" />
					</Box>
				)}
			</Flex>

			{/* Renderizar módulos se existirem */}
			{modules && modules.length > 0 && (
				<Box ml={CATEGORY_MODULE_GAP + "px"}>
					{modules.map((cModule, index) => (
						<ModuleNode
							key={cModule.id}
							index={index}
							blocked={blocked}
							onClick={() => {
								setSelectedModuleId(cModule.id);
							}}
							{...cModule}
						/>
					))}
				</Box>
			)}

			{/* Desafio */}
			{challenge && (
				<Flex
					position="absolute"
					left={CATEGORY_WIDTH / 2 - CHALLENGE_CONTAINER_WIDTH / 2 + "px"}
					top={
						CATEGORY_HEIGHT +
						(modules.length > 0 ? modules.length - 1 : 0) * (MODULE_GAP + MODULE_HEIGHT) +
						CATEGORY_MARGIN +
						CATEGORY_HEIGHT / 2 -
						CHALLENGE_SIZE / 2 +
						"px"
					}
					width={CHALLENGE_CONTAINER_WIDTH + "px"}
					alignItems="center"
					zIndex={999}
					flexDirection="column"
					gap={CHALLENGE_CONTAINER_GAP + "px"}
				>
					<Flex
						backgroundColor="white"
						height={CHALLENGE_SIZE + "px"}
						width={CHALLENGE_SIZE + "px"}
						borderRadius="full"
						border="1px solid"
						alignItems="center"
						justifyContent="center"
						bg={challenge.completed ? "green.50" : "white"}
						borderColor={challenge.completed ? "green.500" : lineColor}
						boxShadow="sm"
					>
						{challenge.completed ? <LockOpen color="green" /> : <Lock />}
					</Flex>
					<Text textAlign="center" color={challenge.completed ? "green.700" : "black"}>
						Desafio
					</Text>
				</Flex>
			)}
		</Flex>
	);
};

const Tree = ({
	trail,
	setSelectedModuleId,
}: Trail & { setSelectedModuleId: (moduleId: string) => void }) => {
	return (
		<Box p={SCREEN_PADDING + "px"} position="relative" width="fit-content">
			<Flex
				align="center"
				border="1px solid"
				borderColor={lineColor}
				borderRadius="full"
				bg="white"
				fontWeight="medium"
				position="relative"
				w={TRAIL_WIDTH + "px"}
				h={TRAIL_HEIGHT + "px"}
				alignItems="center"
				justifyContent="center"
				boxShadow="sm"
			>
				<Text fontSize="lg" whiteSpace="nowrap">
					{trail.name}
				</Text>
			</Flex>
			<Box
				position="absolute"
				top={SCREEN_PADDING + TRAIL_HEIGHT + "px"}
				left={SCREEN_PADDING + TRAIL_WIDTH / 2}
				borderLeft={LINES_SIZE + "px solid"}
				borderColor={lineColor}
				height={CATEGORY_MARGIN + "px"}
				transform="translateX(-50%)"
			/>
			<Box position="relative" ml={(TRAIL_WIDTH - CATEGORY_WIDTH) / 2 + "px"}>
				{trail.categories.map((category, index) => (
					<CategoryNode
						key={category.id}
						index={index}
						{...category}
						lastCategory={trail.categories[index - 1]}
						setSelectedModuleId={setSelectedModuleId}
					/>
				))}
			</Box>
		</Box>
	);
};

const TrailPage = () => {
	const { selectedTrailId } = useTrail();
	const [trailData, setTrailData] = useState<Trail | null>(null);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(undefined);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTrail = async () => {
			if (selectedTrailId) {
				setLoading(true);
				setError(null);
				try {
					const response = await HttpClient.get<Trail>(`/trails/${selectedTrailId}`);
					setTrailData(response.data);
				} catch (error) {
					console.error("Erro ao buscar trilha:", error);
					setError("Não foi possível carregar a trilha");
				} finally {
					setLoading(false);
				}
			}
		};

		fetchTrail();
	}, [selectedTrailId]);

	useEffect(() => {
		if (selectedModuleId) {
			setOpen(true);
		}
	}, [selectedModuleId]);

	const onClose = () => {
		setOpen(false);
		setSelectedModuleId(undefined);
	};

	if (!selectedTrailId) {
		return (
			<Center style={{ width: `calc(100vw - 250px)`, height: "90vh" }}>
				<Text fontSize="xl">Selecione uma trilha no menu lateral</Text>
			</Center>
		);
	}

	if (loading) {
		return (
			<Center style={{ width: `calc(100vw - 250px)`, height: "90vh" }}>
				<Spinner size="xl" />
			</Center>
		);
	}

	if (error) {
		return <Text color="red.500">{error}</Text>;
	}

	return trailData ? (
		<>
			<ScrollContainer style={{ width: `calc(100vw - 250px)`, height: "90vh", overflow: "auto" }}>
				<Tree trail={trailData.trail} setSelectedModuleId={setSelectedModuleId} />
			</ScrollContainer>
			<ModuleDialog open={open} onClose={onClose} moduleId={selectedModuleId} />
		</>
	) : null;
};

export default TrailPage;
