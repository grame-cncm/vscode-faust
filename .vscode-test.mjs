import { defineConfig } from '@vscode/test-cli';

// VSCODE_EXECUTABLE runs the tests in a local VS Code instead of a downloaded one
export default defineConfig({
	files: 'out/test/**/*.test.js',
	// the snippet tests wait up to 10 seconds for the snippets to load
	mocha: { timeout: 20000 },
	...(process.env.VSCODE_EXECUTABLE ? { useInstallation: { fromPath: process.env.VSCODE_EXECUTABLE } } : {}),
});
