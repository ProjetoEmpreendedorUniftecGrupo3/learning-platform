import { createContext, useContext } from "react";
import { usePersistedState } from "../hooks/usePersistedState";

interface CategoryContextType {
	selectedCategoryId: string | null;
	setSelectedCategoryId: (id: string) => void;
}

const CategoryContext = createContext<CategoryContextType>({} as CategoryContextType);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
	const [selectedCategoryId, setSelectedCategoryId] = usePersistedState<string | null>(
		"selectedCategoryId",
		null,
	);

	return (
		<CategoryContext.Provider
			value={{
				selectedCategoryId,
				setSelectedCategoryId,
			}}
		>
			{children}
		</CategoryContext.Provider>
	);
}

export const useCategory = () => useContext(CategoryContext);
