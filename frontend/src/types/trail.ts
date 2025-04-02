export type CategoryModule = {
	id: string;
	title: string;
	completed: boolean;
};

export type Challenge = {
	id: string;
	completed: boolean;
};

export type Category = {
	id: string;
	name: string;
	order: number;
	modules: CategoryModule[];
	challenge: Challenge | null;
	blocked: boolean;
};

export type Trail = {
	trail: {
		id: string;
		name: string;
		categories: Category[];
	};
};
