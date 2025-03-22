module.exports = {
	env: { browser: true, es2020: true },
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended",
		"plugin:prettier/recommended",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: { ecmaVersion: "latest", sourceType: "module" },
	plugins: ["react-refresh", "prettier"],
	rules: {
		"@typescript-eslint/no-explicit-any": "warn",
		"prettier/prettier": "error",
		"react-refresh/only-export-components": "warn",
		"no-unused-vars": "error",
		"react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
	},
	settings: {
		react: { version: "detect" },
	},
};
