import * as vscode from 'vscode';
import { SemanticTagger } from './semanticTagger';
import { TelemetryService } from './telemetry';

let semanticTagger: SemanticTagger;
let telemetryService: TelemetryService;

export function activate(context: vscode.ExtensionContext) {
    console.log('Semantic Tagging extension is now active');

    telemetryService = new TelemetryService();
    semanticTagger = new SemanticTagger(telemetryService);

    // Track extension activation
    telemetryService.trackExtensionActivated();

    // Register commands
    const scanCommand = vscode.commands.registerCommand('semanticTagging.scanFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            semanticTagger.scanDocument(editor.document);
        }
    });

    const insightsCommand = vscode.commands.registerCommand('semanticTagging.showInsights', () => {
        semanticTagger.showInsights();
    });

    // Auto-scan on file open/save
    const onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument((document) => {
        semanticTagger.scanDocument(document);
    });

    const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument((document) => {
        semanticTagger.scanDocument(document);
    });

    context.subscriptions.push(
        scanCommand,
        insightsCommand,
        onDidOpenTextDocument,
        onDidSaveTextDocument
    );
}

export function deactivate() {
    if (telemetryService) {
        telemetryService.dispose();
    }
}