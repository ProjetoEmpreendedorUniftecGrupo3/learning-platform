import {
	VStack,
	Text,
	Spinner,
	HStack,
	Table,
	EmptyState,
	Input,
	Select,
	createListCollection,
	Badge,
	Field,
	IconButton,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { HttpClient } from "lib/httpClient";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface UserListItem {
	id: string;
	email: string;
	fullName: string;
	birthDate: string;
	createdAt: string;
	role: "user" | "admin";
}

interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

interface UsersResponse {
	data: UserListItem[];
	meta: PaginationMeta;
}

interface UsersFilters {
	search: string;
	sortBy: "fullName" | "email" | "birthDate" | "createdAt";
	sortOrder: "ASC" | "DESC";
	page: number;
}

export const AdminUsersPage = () => {
	const [users, setUsers] = useState<UserListItem[]>([]);
	const [meta, setMeta] = useState<PaginationMeta>({
		page: 1,
		limit: 25,
		total: 0,
		totalPages: 0,
		hasPreviousPage: false,
		hasNextPage: false,
	});
	const [loading, setLoading] = useState(true);
	const [searchInputValue, setSearchInputValue] = useState("");
	const [filters, setFilters] = useState<UsersFilters>({
		search: "",
		sortBy: "createdAt",
		sortOrder: "DESC",
		page: 1,
	});

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (filters.search.trim()) params.append("search", filters.search.trim());
			params.append("sortBy", filters.sortBy);
			params.append("sortOrder", filters.sortOrder);
			params.append("page", filters.page.toString());
			params.append("limit", "25");

			const { data } = await HttpClient.get<UsersResponse>(`/users?${params.toString()}`);
			setUsers(data.data);
			setMeta(data.meta);
		} catch (e) {
			console.log("GET ALL USERS ERROR: ", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters]);

	const handleSearch = () => {
		setFilters((prev) => ({ ...prev, search: searchInputValue, page: 1 }));
	};

	const handleSearchKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const handleSortChange = (sortBy: string, sortOrder: string) => {
		setFilters((prev) => ({
			...prev,
			sortBy: sortBy as "fullName" | "email" | "birthDate" | "createdAt",
			sortOrder: sortOrder as "ASC" | "DESC",
			page: 1,
		}));
	};

	const handlePageChange = (newPage: number) => {
		setFilters((prev) => ({ ...prev, page: newPage }));
	};

	const sortByOptions = useMemo(() => {
		return createListCollection({
			items: [
				{ label: "Nome", value: "fullName" },
				{ label: "Email", value: "email" },
				{ label: "Data de Nascimento", value: "birthDate" },
				{ label: "Data de Criação", value: "createdAt" },
			],
		});
	}, []);

	const sortOrderOptions = useMemo(() => {
		return createListCollection({
			items: [
				{ label: "Crescente (A-Z)", value: "ASC" },
				{ label: "Decrescente (Z-A)", value: "DESC" },
			],
		});
	}, []);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("pt-BR");
	};

	const getRoleBadge = (role: string) => {
		return (
			<Badge colorPalette={role === "admin" ? "orange" : "blue"} size="sm">
				{role === "admin" ? "Admin" : "Usuário"}
			</Badge>
		);
	};

	const renderPagination = () => {
		if (meta.totalPages <= 1) return null;

		const startItem = (meta.page - 1) * meta.limit + 1;
		const endItem = Math.min(meta.page * meta.limit, meta.total);

		return (
			<HStack justify="space-between" mt={4}>
				<Text fontSize="sm" color="gray.600">
					Mostrando {startItem} a {endItem} de {meta.total} usuários
				</Text>
				<HStack gap={2}>
					<IconButton
						size="sm"
						variant="outline"
						disabled={!meta.hasPreviousPage}
						onClick={() => handlePageChange(meta.page - 1)}
					>
						<ChevronLeft />
					</IconButton>
					<Text fontSize="sm">
						Página {meta.page} de {meta.totalPages}
					</Text>
					<IconButton
						size="sm"
						variant="outline"
						disabled={!meta.hasNextPage}
						onClick={() => handlePageChange(meta.page + 1)}
					>
						<ChevronRight />
					</IconButton>
				</HStack>
			</HStack>
		);
	};

	if (loading && filters.page === 1) {
		return (
			<VStack justify="center" style={{ width: `calc(100vw - 250px)`, height: "90vh" }}>
				<Spinner size="xl" />
			</VStack>
		);
	}

	return (
		<VStack align="stretch" p={6} style={{ width: `calc(100vw - 250px)`, minHeight: "90vh" }}>
			<HStack justify="space-between" mb={6}>
				<Text fontSize="2xl">Listagem de usuários</Text>
			</HStack>

			{/* Filtros */}
			<VStack align="stretch" gap={4} mb={6}>
				<HStack gap={4} wrap="wrap">
					<Field.Root width="300px">
						<Field.Label>Buscar por nome ou email</Field.Label>
						<HStack gap={2}>
							<Input
								width="250px"
								placeholder="Digite para buscar..."
								value={searchInputValue}
								onChange={(e) => setSearchInputValue(e.target.value)}
								onKeyDown={handleSearchKeyPress}
							/>
							<IconButton colorPalette="blue" onClick={handleSearch} aria-label="Buscar">
								<Search />
							</IconButton>
						</HStack>
					</Field.Root>

					<Field.Root width="200px">
						<Field.Label>Ordenar por</Field.Label>
						<Select.Root
							collection={sortByOptions}
							value={[filters.sortBy]}
							onValueChange={(e) => handleSortChange(e.value[0], filters.sortOrder)}
						>
							<Select.HiddenSelect />
							<Select.Control>
								<Select.Trigger>
									<Select.ValueText />
								</Select.Trigger>
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Control>
							<Select.Positioner>
								<Select.Content>
									{sortByOptions.items.map((option) => (
										<Select.Item item={option} key={option.value}>
											{option.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Select.Root>
					</Field.Root>

					<Field.Root width="200px">
						<Field.Label>Ordem</Field.Label>
						<Select.Root
							collection={sortOrderOptions}
							value={[filters.sortOrder]}
							onValueChange={(e) => handleSortChange(filters.sortBy, e.value[0])}
						>
							<Select.HiddenSelect />
							<Select.Control>
								<Select.Trigger>
									<Select.ValueText />
								</Select.Trigger>
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Control>
							<Select.Positioner>
								<Select.Content>
									{sortOrderOptions.items.map((option) => (
										<Select.Item item={option} key={option.value}>
											{option.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Select.Root>
					</Field.Root>
				</HStack>
			</VStack>

			{loading ? (
				<VStack justify="center" py={10}>
					<Spinner size="lg" />
					<Text>Carregando usuários...</Text>
				</VStack>
			) : !users.length ? (
				<EmptyState.Root>
					<EmptyState.Content>
						<VStack textAlign="center">
							<EmptyState.Title>Nenhum usuário encontrado</EmptyState.Title>
							<EmptyState.Description>
								{filters.search
									? "Tente ajustar os filtros de busca"
									: "Não há usuários cadastrados no sistema"}
							</EmptyState.Description>
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			) : (
				<>
					<Table.ScrollArea>
						<Table.Root variant="outline">
							<Table.Header>
								<Table.Row>
									<Table.ColumnHeader>Nome</Table.ColumnHeader>
									<Table.ColumnHeader>Email</Table.ColumnHeader>
									<Table.ColumnHeader width="120px" textAlign="center">
										Perfil
									</Table.ColumnHeader>
									<Table.ColumnHeader width="140px" textAlign="center">
										Data de Nascimento
									</Table.ColumnHeader>
									<Table.ColumnHeader width="140px" textAlign="center">
										Criado em
									</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{users.map((user) => (
									<Table.Row key={user.id}>
										<Table.Cell>{user.fullName}</Table.Cell>
										<Table.Cell>{user.email}</Table.Cell>
										<Table.Cell textAlign="center">{getRoleBadge(user.role)}</Table.Cell>
										<Table.Cell textAlign="center">{formatDate(user.birthDate)}</Table.Cell>
										<Table.Cell textAlign="center">{formatDate(user.createdAt)}</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Table.ScrollArea>

					{renderPagination()}
				</>
			)}
		</VStack>
	);
};
