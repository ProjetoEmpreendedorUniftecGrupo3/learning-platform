export type User = {
	id: string;
	email: string;
	fullName: string;
	birthDate: string;
	role: "user" | "admin";
	createdAt: string;
};
