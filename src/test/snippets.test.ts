import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Snippet completions offered at the end of a Faust document
async function snippetsAt(text: string): Promise<vscode.CompletionItem[]> {
	const doc = await vscode.workspace.openTextDocument({ language: 'faust', content: text });
	await vscode.window.showTextDocument(doc);
	const end = doc.positionAt(text.length);
	const list = await vscode.commands.executeCommand<vscode.CompletionList>(
		'vscode.executeCompletionItemProvider', doc.uri, end);
	return list.items.filter(item => item.kind === vscode.CompletionItemKind.Snippet);
}

// Snippet files are loaded asynchronously after startup: wait up to 10 seconds
// for the first snippets to be offered in an empty document
async function waitForSnippets() {
	for (let attempt = 0; attempt < 40; attempt++) {
		if ((await snippetsAt('')).length > 0) {
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 250));
	}
}

function label(item: vscode.CompletionItem): string {
	return typeof item.label === 'string' ? item.label : item.label.label;
}

function body(item: vscode.CompletionItem): string {
	const text = item.insertText;
	return text instanceof vscode.SnippetString ? text.value : String(text);
}

suite('Faust snippets', () => {
	suiteSetup(waitForSnippets);

	const root = path.resolve(__dirname, '../..');
	const library = JSON.parse(fs.readFileSync(path.join(root, 'snippets/faust-library.json'), 'utf8'));
	const language = JSON.parse(fs.readFileSync(path.join(root, 'snippets/faust-snippets.json'), 'utf8'));

	// Text of the document once the snippet of the given body, offered at
	// the end of text, is inserted
	async function expand(text: string, snippet: string): Promise<string> {
		const items = (await snippetsAt(text)).filter(item => body(item) === snippet);
		assert.strictEqual(items.length, 1, snippet + ' offered ' + items.length + ' times after ' + JSON.stringify(text));
		const range = items[0].range;
		const editor = vscode.window.activeTextEditor!;
		await editor.insertSnippet(items[0].insertText as vscode.SnippetString,
			range instanceof vscode.Range ? range : range!.replacing);
		return editor.document.getText();
	}

	const expansions: [string, string, string][] = [
		['process = lowp', 'fi.lowpass', 'process = fi.lowpass'],
		['process = fi.lowp', 'fi.lowpass', 'process = fi.lowpass'],
		['process = fi.', 'fi.lowpass', 'process = fi.lowpass'],
		['process = _ : fi.lowp', 'fi.lowpass', 'process = _ : fi.lowpass'],
		['process = (os.osc(440), fi.lowp', 'fi.lowpass', 'process = (os.osc(440), fi.lowpass'],
		['process = clarinet_ui', 'pm.clarinet_ui_MIDI', 'process = pm.clarinet_ui_MIDI'],
		['process = pm.clar', 'pm.clarinet_ui_MIDI', 'process = pm.clarinet_ui_MIDI'],
	];
	for (const [text, snippet, expected] of expansions) {
		test('"' + text + '" expands to ' + snippet + ', library prefix once', async () => {
			assert.strictEqual(await expand(text, snippet), expected);
		});
	}

	test('functions of a header with several names are offered', async () => {
		const items = await snippetsAt('process = fft');
		assert.ok(items.some(item => body(item) === 'an.fftb'), 'an.fftb not offered');
	});

	test('core language snippets are still offered', async () => {
		const items = await snippetsAt('hsl');
		assert.ok(items.some(item => label(item) === 'hslider' && body(item).startsWith('hslider("${1:title}"')),
			'hslider snippet not offered');
	});

	test('every snippet is offered', async () => {
		const items = await snippetsAt('');
		const bodies = new Set(items.map(body));
		const missing = [...Object.values(library), ...Object.values(language)]
			.map((s: any) => s.body as string)
			.filter(b => !bodies.has(b));
		assert.deepStrictEqual(missing, []);
	});
});

suite('Faust extension', () => {
	test('is identified as a GRAME extension and activates on Faust files', async () => {
		const extension = vscode.extensions.getExtension('grame.vscode-faust');
		assert.ok(extension, 'grame.vscode-faust not found');
		const doc = await vscode.workspace.openTextDocument({ language: 'faust', content: 'process = _;' });
		await vscode.window.showTextDocument(doc);
		await extension.activate();
		assert.ok(extension.isActive, 'grame.vscode-faust not active');
	});
});
