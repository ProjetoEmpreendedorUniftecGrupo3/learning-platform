import { Box, Text, Flex, Spinner } from "@chakra-ui/react";
import { Category, CategoryModule, Trail } from "types/trail";
import { Lock } from "lucide-react";
import { HttpClient } from "lib/httpClient";
import { useEffect, useState } from "react";
import { useTrail } from "contexts/UserContext";
import ScrollContainer from "react-indiana-drag-scroll";
import "react-indiana-drag-scroll/dist/style.css";

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

const ModuleNode = ({ id, title, index }: CategoryModule & { index: number }) => {
	return (
		<Box
			key={id}
			position="relative"
			mt={index > 0 ? MODULE_GAP + "px" : FIRST_MODULE_MARGIN + "px"}
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
				<>
					<Box
						position="absolute"
						top={-(MODULE_GAP + MODULE_HEIGHT / 2) + LINES_SIZE / 2 + "px"}
						left={-(CATEGORY_MODULE_GAP - CATEGORY_MODULE_GAP / 3) + "px"}
						borderLeft={LINES_SIZE + "px solid"}
						borderColor={lineColor}
						height={MODULE_GAP + MODULE_HEIGHT + "px"}
						transform="translateX(-50%)"
					/>
				</>
			)}

			{/* Conteúdo do nó */}
			<Flex
				align="center"
				border="1px solid"
				borderColor={lineColor}
				borderRadius="full"
				px="16px"
				py="4px"
				bg="white"
				fontWeight="medium"
				position="relative"
				w="fit-content"
				h={MODULE_HEIGHT + "px"}
				alignItems="center"
				justifyContent="center"
			>
				<Text textWrap="nowrap">{title}</Text>
			</Flex>
		</Box>
	);
};

const CategoryNode = ({
	id,
	name,
	modules,
	challenge,
	index,
	lastCategory,
}: Category & { index: number; lastCategory: Category }) => {
	const lastCategoryHeight =
		index > 0
			? MODULE_HEIGHT +
				FIRST_MODULE_MARGIN +
				(lastCategory.modules.length - 1) * (MODULE_HEIGHT + MODULE_GAP) -
				CATEGORY_HEIGHT
			: 0;

	console.log(
		MODULE_HEIGHT +
			FIRST_MODULE_MARGIN +
			(modules.length > 0 ? modules.length - 1 : 0) * (MODULE_GAP + MODULE_HEIGHT) +
			CATEGORY_MARGIN +
			CATEGORY_HEIGHT / 2 -
			CHALLENGE_SIZE / 2,
	);
	return (
		<Flex
			key={id}
			position="relative"
			mt={CATEGORY_MARGIN + "px"}
			ml={index > 0 ? CATEGORY_WIDTH * 2 * index : 0}
		>
			{/* Linha que conecta o nó ao seu "pai" (exceto se for nível 0) */}
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
				borderColor={lineColor}
				borderRadius="full"
				bg="white"
				fontWeight="medium"
				position="relative"
				w={CATEGORY_WIDTH + "px"}
				h={CATEGORY_HEIGHT + "px"}
				alignItems="center"
				justifyContent="center"
				px="16px"
				py="4px"
			>
				<Text textWrap="nowrap">{name}</Text>
			</Flex>

			{/* Renderizar filhos, se existirem */}
			{modules && modules.length > 0 && (
				<Box ml={CATEGORY_MODULE_GAP + "px"}>
					{modules.map((cModule, index) => (
						<ModuleNode key={index} index={index} {...cModule} />
					))}
				</Box>
			)}

			{challenge ? (
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
						borderColor={lineColor}
						alignItems="center"
						justifyContent="center"
					>
						<Lock />
					</Flex>
					<Text textAlign={"center"}>Desafio</Text>
				</Flex>
			) : null}
		</Flex>
	);
};
const Tree = ({ trail }: Trail) => {
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
			>
				<Text fontSize="lg" textWrap="nowrap">
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
						key={index}
						index={index}
						{...category}
						lastCategory={trail.categories[index - 1]}
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

	if (!selectedTrailId) {
		return <Text>Selecione uma trilha no menu lateral</Text>;
	}

	if (loading) {
		return <Spinner />;
	}

	if (error) {
		return <Text color="red.500">{error}</Text>;
	}

	return trailData ? (
		<ScrollContainer style={{ width: `calc(100vw - 250px)`, height: "90vh", overflow: "auto" }}>
			<Tree trail={trailData.trail} />
		</ScrollContainer>
	) : null;
};

export default TrailPage;
