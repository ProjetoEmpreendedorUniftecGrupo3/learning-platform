export type QuestionAlternative = {
	id: string;
	text: string;
};

export type ChallengeQuestion = {
	id: string;
	question: string;
	alternatives: QuestionAlternative[];
};

export type ChallengeToDo = {
	id: string;
	questions: ChallengeQuestion[];
};
