import { createContext, useContext } from "react";
import { usePersistedState } from "../hooks/usePersistedState";

interface TrailContextType {
	selectedTrailId: string | null;
	setSelectedTrailId: (id: string | null) => void;
}

const TrailContext = createContext<TrailContextType>({} as TrailContextType);

export function TrailProvider({ children }: { children: React.ReactNode }) {
	const [selectedTrailId, setSelectedTrailId] = usePersistedState<string | null>(
		"selectedTrailId",
		null,
	);

	return (
		<TrailContext.Provider
			value={{
				selectedTrailId,
				setSelectedTrailId,
			}}
		>
			{children}
		</TrailContext.Provider>
	);
}

export const useTrail = () => useContext(TrailContext);
