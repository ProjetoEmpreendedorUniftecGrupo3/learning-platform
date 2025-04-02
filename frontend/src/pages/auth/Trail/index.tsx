import { Box, Text, Flex } from "@chakra-ui/react";
import { Category, CategoryModule, Trail } from "types/trail";
import { Lock } from "lucide-react";

const data: Trail = {
	trail: {
		id: "d69918a0-ce41-4554-b760-cc036d65298f",
		name: "Frontend",
		categories: [
			{
				id: "cf40c462-0cd7-4bba-a47f-4459fa8d9f32",
				name: "Internet",
				order: 1,
				modules: [
					{
						id: "1",
						title: "Como a internet funciona?",
						completed: true,
					},
					{
						id: "2",
						title: "O que é HTTP?",
						completed: true,
					},
					{
						id: "3",
						title: "O que é um Domínio?",
						completed: false,
					},
					{
						id: "4",
						title: "O que é uma hospedagem?",
						completed: false,
					},
				],
				challenge: null,
				blocked: false,
			},
			{
				id: "9e12ba97-08dc-4ce4-816b-5d250405d62a",
				name: "HTML",
				order: 2,
				modules: [
					{
						id: "1",
						title: "Aprenda o básico",
						completed: true,
					},
					{
						id: "2",
						title: "Escrevendo HTML",
						completed: false,
					},
					{
						id: "3",
						title: "Formulários",
						completed: false,
					},
				],
				challenge: {
					id: "0eeb86a9-faff-43b8-a0dc-58be9ee4fe43",
					completed: false,
				},
				blocked: false,
			},
			{
				id: "ba6be45c-e33f-46b5-a2da-6a2f1ff4194e",
				name: "CSS",
				order: 3,
				modules: [
					{
						id: "1",
						title: "Aprendendo CSS",
						completed: false,
					},
					{
						id: "2",
						title: "CSS avançado",
						completed: false,
					},
				],
				challenge: null,
				blocked: true,
			},
		],
	},
};

const lineColor = "gray";

const SCREEN_PADDING = 38;
const LINES_SIZE = 4;
const TRAIL_HEIGHT = 60;
const TRAIL_WIDTH = 200;
const CATEGORY_HEIGHT = 40;
const CATEGORY_WIDTH = 160;
const CATEGORY_MARGIN = 32;
const CATEGORY_MODULE_GAP = 96;
const MODULE_HEIGHT = 32;
const MODULE_GAP = 32;
const FIRST_MODULE_MARGIN = (CATEGORY_HEIGHT - MODULE_HEIGHT) / 2;
const CHALLENGE_SIZE = 60;
const CHALLENGE_CONTAINER_WIDTH = 60;
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
				top="16px"
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
				borderRadius="md"
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
				<Text>{title}</Text>
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
						top={-(CATEGORY_MARGIN + lastCategoryHeight) + "px"}
						left={-(CATEGORY_WIDTH * 2 - CATEGORY_WIDTH / 2) + "px"}
						borderLeft={LINES_SIZE + "px solid"}
						borderColor={lineColor}
						height={CATEGORY_MARGIN + CATEGORY_HEIGHT / 2 + lastCategoryHeight + "px"}
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
				borderRadius="md"
				bg="white"
				fontWeight="medium"
				position="relative"
				w={CATEGORY_WIDTH + "px"}
				h={CATEGORY_HEIGHT + "px"}
				alignItems="center"
				justifyContent="center"
			>
				<Text>{name}</Text>
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
						MODULE_HEIGHT +
						FIRST_MODULE_MARGIN +
						(modules.length - 1) * (MODULE_GAP + MODULE_HEIGHT) +
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
						borderRadius="9999px"
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
		<Box p={SCREEN_PADDING + "px"} position="relative">
			<Flex
				align="center"
				border="1px solid"
				borderColor={lineColor}
				borderRadius="md"
				bg="white"
				fontWeight="medium"
				position="relative"
				w={TRAIL_WIDTH + "px"}
				h={TRAIL_HEIGHT + "px"}
				alignItems="center"
				justifyContent="center"
			>
				<Text fontSize="lg">{trail.name}</Text>
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

export default function Page() {
	return <Tree trail={data.trail} />;
}
