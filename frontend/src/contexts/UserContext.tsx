import { createContext, useContext, useState } from "react";

interface TrailContextType {
	selectedTrailId: string | null;
	setSelectedTrailId: (id: string) => void;
}

const TrailContext = createContext<TrailContextType>({} as TrailContextType);

export function TrailProvider({ children }: { children: React.ReactNode }) {
	const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);

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
