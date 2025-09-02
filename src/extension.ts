// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

import fs from "fs";
import path from "path";
import which from "which";

let client: LanguageClient;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const serverOptions: ServerOptions = {
    run: { command: 'faustlsp', transport: TransportKind.stdio },
    debug: { command: 'faustlsp', transport: TransportKind.stdio },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for all documents by default
    documentSelector: [{ scheme: "file", language: "faust" }],
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "faustlsp",
    "Faust LSP",
    serverOptions,
    clientOptions
  );

  const faustConfigFile = ".faustcfg.json";
  var configFileExists: boolean = true;
  var executableExists: boolean;
  var workspaceFolderPath: string = "";

  let folders = vscode.workspace.workspaceFolders;
  // Check if workspace has a config file
  if (folders !== undefined) {
    // Supports only one workspace folder for now
    workspaceFolderPath = folders[0].uri.fsPath;
  }

  let configFile = path.join(workspaceFolderPath, faustConfigFile);
  console.log(configFile);

  try {
    fs.accessSync(configFile, fs.constants.F_OK);
  } catch (err) {
    if (err) {
      configFileExists = false;
    } else {
      configFileExists = true;
    }
  };

  // Start the client. This will also launch the server
  if (!configFileExists) {
    vscode.window.showWarningMessage("Please create a " + faustConfigFile + " file in workspace root and restart extension");
//     const watcher = vscode.workspace.createFileSystemWatcher(
//       "**/*.json"
//     );
//     watcher.onDidCreate((event) => { 
//         console.log(event);
//         configFileExists = true;
//        console.log("User created faust config file"); 
//    });
//     watcher.onDidChange((event) => { 
//         console.log(event);
//         configFileExists = true;
//         console.log("User created faust config file"); 
//     });
//     watcher.dispose();
  }

  // Check if faustlsp is in PATH
  executableExists = which.sync('faustlsp', {nothrow: true}) !== null;
  if (!executableExists) {
    vscode.window.showWarningMessage("Could not find faustlsp in PATH. Please install faustlsp.");
  }

  if (configFileExists && executableExists) {
    vscode.window.showInformationMessage("Starting faustlsp");
    client.start();
  }
}

// This method is called when your extension is deactivated
export async function deactivate() {
  if (!client) {
    return undefined;
  }
  vscode.window.showInformationMessage("Ending faustlsp");
  return client.stop();
}

