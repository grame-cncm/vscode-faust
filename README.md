# Faust Support for Visual Studio Code

![Faust Logo](images/faust-logo.png)

This extension, maintained by [GRAME](https://www.grame.fr), provides syntax highlighting of [Faust](https://faust.grame.fr/) source files, snippets for the core language and the standard libraries, and starts the [faustlsp](https://github.com/grame-cncm/faustlsp) language server when it is installed.

![Screenshot](images/screenshot.png)

## Features

- Syntax highlighting of the [Faust programming language](https://faustdoc.grame.fr/) in `.dsp` and `.lib` files.
- Snippets for the core language (`import`, `process`, `hslider`, `with`, ...).
- Snippets for every function documented in the libraries of `stdfaust.lib`: typing `lowp` or `fi.lowp` offers `fi.lowpass`, with the first sentence of its documentation.
- With faustlsp: diagnostics, hover documentation, completion, document symbols, go to definition and formatting.

## Installation

The extension is distributed as a `.vsix` file.

### Install a `.vsix` file

Get `vscode-faust-<version>.vsix` from the [releases page](https://github.com/grame-cncm/vscode-faust/releases), or build it from the sources (see below). Then either:

- in VS Code, open the Extensions view (`Cmd+Shift+X` on macOS, `Ctrl+Shift+X` elsewhere), click the `...` menu at the top of the view, choose **Install from VSIX...** and select the file;
- or, from a terminal:

  ```sh
  code --install-extension vscode-faust-2.0.0.vsix
  ```

Reload VS Code if asked. Open a `.dsp` file: the language mode in the status bar shows **Faust**.

The extension identifier is `grame.vscode-faust`. It is distinct from the older _Faust_ extension by Glen Anderson on the Marketplace (`glen-anderson.vscode-faust`), from which it derives: uninstall that one, otherwise both provide highlighting and snippets for Faust files. When it is found, the extension offers to uninstall it.

### Build the `.vsix` from the sources

This needs [Node.js](https://nodejs.org/) 20 or later.

```sh
git clone https://github.com/grame-cncm/vscode-faust.git
cd vscode-faust
npm install
npm run package
```

`npm run package` writes `vscode-faust-<version>.vsix` in the project folder; install it as above.

### Language server (optional)

Highlighting and snippets work without it. For diagnostics, hover documentation and the other language features, install faustlsp, which needs [Go](https://go.dev/) 1.24 or later:

```sh
go install github.com/carn181/faustlsp@latest
```

This installs `faustlsp` in `$HOME/go/bin`, which must be in the `PATH` seen by VS Code. Install [faustfmt](https://github.com/carn181/faustfmt) as well for formatting.

The language server starts only when the workspace folder contains a `.faustcfg.json` file, for example:

```json
{
  "command": "faust",
  "process_name": "process",
  "process_files": ["main.dsp"],
  "compiler_diagnostics": true
}
```

Otherwise the extension shows a warning when a Faust file is opened, and only highlighting and snippets are available. The options are described in the [faustlsp README](https://github.com/grame-cncm/faustlsp#configuration).

## Requirements

- [Faust](https://github.com/grame-cncm/faust/releases) 2.5 or greater
- VS Code 1.101 or greater

## Development

Open this folder in VS Code and press `F5` (**Run Extension**): a second VS Code window opens with the extension loaded from the sources.

`npm test` compiles, lints and runs the tests in a VS Code downloaded in `.vscode-test/`. To run them in the VS Code installed on the machine instead:

```sh
VSCODE_EXECUTABLE="/Applications/Visual Studio Code.app/Contents/MacOS/Code" npm test
```

## Publishing a release

The workflow `.github/workflows/release.yml` publishes a release when a
`v<version>` tag is pushed: it runs the tests, builds the `.vsix` and
attaches it to a new GitHub release. The tag must match the `version` of
`package.json`, otherwise the workflow stops. For example, for 2.1.0:

```sh
npm version 2.1.0 --no-git-tag-version   # updates package.json and package-lock.json
git commit -am "Set version to 2.1.0."
git tag v2.1.0
git push origin master v2.1.0
```

Follow the run in the **Actions** tab of the repository; the release
appears on the [releases page](https://github.com/grame-cncm/vscode-faust/releases).

## Updating the library snippets

`snippets/faust-snippets.json` holds the core language snippets and is
edited by hand. `snippets/faust-library.json` is generated from the
libraries imported by `stdfaust.lib`, with the `faust2atomsnippets` tool
of the Faust distribution. From the `libraries` folder of a Faust
checkout:

```sh
python3 ../tools/faust2appls/faust2atomsnippets -j \
    $(sed -n 's/^[a-z][a-z] = library("\(.*\)");/\1/p' stdfaust.lib \
      | grep -v '^all.lib$' | while read l; do [ -f $l ] && echo $l; done) \
    > /path/to/vscode-faust/snippets/faust-library.json
```

## Acknowlegements

- The language grammar and snippets were derived in part from the [atom syntax highlighting plugin for Faust](https://github.com/grame-cncm/faust/tree/master-dev/syntax-highlighting/atom/language-faust) and released under [this license](https://github.com/grame-cncm/faust/blob/master-dev/syntax-highlighting/atom/language-faust/LICENSE.md). Thanks to Yann Orlarey ([@orlarey](https://github.com/orlarey)) and other contributors for their work!
- The extension was first written by Glen Anderson ([hellbent/vscode-faust](https://github.com/hellbent/vscode-faust)); the faustlsp client was added by [carn181](https://github.com/carn181/vscode-faust-original).
