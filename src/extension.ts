// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { exec } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	vscode.workspace.findFiles("script.ts",'',1).then((file)	=>{
		if(file.length === 0){
			vscode.commands.executeCommand('setContext', 'myExtension.file', false);
			console.error(`File  doesn't exist in `);
    	} else {
      	// The file exists
		  vscode.commands.executeCommand('setContext', 'myExtension.file', true);
      	console.log(`File exists in `);
    	}
	});
	let update = vscode.commands.registerCommand('test.Update-HeckLib',async () => {
		const repositoryUrl = 'https://github.com/Heck-Library/HeckLib'; // Replace with the URL of the Git repository you want to clone
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
		  return; // No workspace folder found
		}
		const workspaceFolder = workspaceFolders[0];
		const workspaceFolderPath = workspaceFolder.uri.fsPath;
		let tempFolderPath = path.join(os.tmpdir(), 'repo'); // Create a temporary folder path
		await vscode.commands.executeCommand('git.clone', repositoryUrl, tempFolderPath);
		const repoFolderPath = path.join(workspaceFolderPath);
		tempFolderPath = path.join(tempFolderPath, 'HeckLib');
		removeFolder(repoFolderPath,["cinema","consts","doc","effect","environment","events","functions","info","map","model","objects"]);
		await copyFolder(tempFolderPath, repoFolderPath,[".gitignore","package-lock.json","heckExporter.py","package.json","README.md","script.ts","functions.ts"]); // Copy the contents of the temporary folder to the workspace folder
		await removeFolder(tempFolderPath); // Remove the temporary folder
		vscode.commands.executeCommand('workbench.action.reloadWindow');
		vscode.window.showInformationMessage('HeckLib Updated');
	});
	let download = vscode.commands.registerCommand('test.Download-HeckLib',async () => {
		const repositoryUrl = 'https://github.com/Heck-Library/HeckLib'; // Replace with the URL of the Git repository you want to clone
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
		  return; // No workspace folder found
		}
		const workspaceFolder = workspaceFolders[0];
		const workspaceFolderPath = workspaceFolder.uri.fsPath;
		let tempFolderPath = path.join(os.tmpdir(), 'repo'); // Create a temporary folder path
		await vscode.commands.executeCommand('git.clone', repositoryUrl, tempFolderPath);
		const repoFolderPath = path.join(workspaceFolderPath);
		tempFolderPath = path.join(tempFolderPath, 'HeckLib');
		await copyFolder(tempFolderPath, repoFolderPath , [".gitignore","package-lock.json","heckExporter.py","package.json","README.md"]); // Copy the contents of the temporary folder to the workspace folder
		await removeFolder(tempFolderPath); // Remove the temporary folder
		vscode.commands.executeCommand('workbench.action.reloadWindow').then( async () => {
			vscode.window.showInformationMessage('HeckLib Downloaded');
		});
	});
	let downloadDep = vscode.commands.registerCommand('test.Download-HeckLib-Dependencies',async () => {
		const terminal = vscode.window.createTerminal();
		terminal.show();
		await terminal.sendText('npm install -g ts-node nodemon swc');
		await terminal.sendText('npm install @types/node')
	});
	let run = vscode.commands.registerCommand('test.Run-HeckLib',async () => {
		const terminal = vscode.window.createTerminal();
		terminal.show();
		await terminal.sendText('nodemon ./script.ts -e ts');
	});
	async function copyFolder(source: string, destination: string, skip?: string[]) {
		if (!fs.existsSync(destination)) {
		  fs.mkdirSync(destination); // Create the destination folder if it doesn't exist
		}
		const files = fs.readdirSync(source, { withFileTypes: true });
		for (const file of files) {
		  const sourcePath = path.join(source, file.name);
		  const destinationPath = path.join(destination, file.name);
		  if (file.isDirectory()) {
			if (file.name === '.git' || file.name === '.github') {
				continue; // Skip the .git and .github folders
			  }
				await copyFolder(sourcePath, destinationPath); // Recursively copy subfolders and their contents	
		  } else {
			if(skip && skip.includes(file.name)){
				continue; // skip these files
			}
				fs.copyFileSync(sourcePath, destinationPath); // Copy files
		  }
		}
	  }
	  
	  async function removeFolder(folderPath: string, skip?: string[]) {
		if (fs.existsSync(folderPath)) {
		  const files = fs.readdirSync(folderPath);
		  for (const file of files) {
			if(skip && !skip.includes(file)){
				continue; // skip these files
			}
			const filePath = path.join(folderPath, file);
			if (fs.statSync(filePath).isDirectory()) {
			  await removeFolder(filePath); // Recursively remove subfolders and their contents
			} else {
			  fs.unlinkSync(filePath); // Delete files
			}
		  }
		  fs.rmdirSync(folderPath); // Delete the folder
		}
	  }
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(update);
	context.subscriptions.push(download);
	context.subscriptions.push(downloadDep);
	context.subscriptions.push(run);
}

// This method is called when your extension is deactivated
export function deactivate() {}
