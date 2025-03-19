module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint", "filename", "prettier"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
	rules: {
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/consistent-type-imports": "off",
		"filename/filename-match": [
			"error",
			{
				patterns: [
					"^[a-z0-9-.]+(.d|.spec|.test|.e2e-spec|.e2e-test)?$",
					"^[a-z0-9-]+(.entity|.dto|.module|.service|.controller|.guard|.strategy|.decorator|.filter|.pipe|.exception|.constants|.interface|.model|.config|.provider|.schema|.util|.helper|.middleware|.validator|.mock|.factory)?$",
				],
				case: "kebabCase",
			},
		],
	},
	ignorePatterns: [".eslintrc.js", "dist/**/*", "test/**/*"],
};
