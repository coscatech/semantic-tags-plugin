import * as vscode from 'vscode';
import { SemanticTagger } from './semanticTagger';
import { TelemetryService } from './telemetry';

let semanticTagger: SemanticTagger;
let telemetryService: TelemetryService;

async function showPrivacyNoticeIfNeeded(context: vscode.ExtensionContext) {
    const hasSeenNotice = context.globalState.get('hasSeenPrivacyNotice', false);
    
    if (!hasSeenNotice) {
        const choice = await vscode.window.showInformationMessage(
            '🔒 COSCA Semantic Tagging: We track tag types, not code',
            {
                detail: 'This extension can collect anonymous pattern statistics to improve infrastructure analysis. We never collect your actual code, file names, or personal data. Telemetry is disabled by default.',
                modal: true
            },
            'Learn More',
            'Enable Telemetry',
            'Keep Disabled'
        );
        
        if (choice === 'Learn More') {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/coscatech/semantic-tags-plugin/blob/main/PRIVACY.md'));
        } else if (choice === 'Enable Telemetry') {
            const config = vscode.workspace.getConfiguration('semanticTagging');
            await config.update('enableTelemetry', true, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('✅ Telemetry enabled - thank you for helping improve COSCA!');
        }
        
        await context.globalState.update('hasSeenPrivacyNotice', true);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('🏷️ COSCA Semantic Tagging extension is now active');

    telemetryService = new TelemetryService();
    semanticTagger = new SemanticTagger(telemetryService);

    // Show privacy notice on first run
    showPrivacyNoticeIfNeeded(context);
    
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