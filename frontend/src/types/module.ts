export enum ModuleContentType {
	DOCUMENT = "document",
	VIDEO = "video",
	BLOG = "blog",
	IMAGE = "image",
	WEBSITE = "website",
}

export type Module = {
	id: string;
	title: string;
	description: string;
	contents: ModuleContent[];
	completed: boolean;
};

export type ModuleContent = {
	id: string;
	type: ModuleContentType;
	description: string;
	url: string;
};
