import * as vscode from 'vscode';
import { ProtectedSemanticTagger } from './protection/protectedSemanticTagger';
import { TelemetryService } from './telemetry';
import { configManager } from './config';

let semanticTagger: ProtectedSemanticTagger;
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

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('🚀 COSCA Semantic Tagging extension is activating...');

    try {
        // Initialize services
        telemetryService = new TelemetryService();
        semanticTagger = new ProtectedSemanticTagger(telemetryService);

        // Show privacy notice on first run
        await showPrivacyNoticeIfNeeded(context);
        
        // Track extension activation (async, don't wait)
        telemetryService.trackExtensionActivated().catch(error => {
            console.warn('Failed to track extension activation:', error);
        });

        console.log('✅ Semantic Tagging extension activated successfully');
    } catch (error) {
        console.error('❌ Failed to activate Semantic Tagging extension:', error);
        vscode.window.showErrorMessage('Failed to activate Semantic Tagging extension. Please check the logs.');
        throw error;
    }

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

export async function deactivate(): Promise<void> {
    console.log('🔄 Deactivating Semantic Tagging extension...');
    
    const cleanupTasks = [];
    
    if (semanticTagger) {
        try {
            semanticTagger.dispose();
        } catch (error) {
            console.warn('Failed to dispose semantic tagger:', error);
        }
    }
    
    if (telemetryService) {
        cleanupTasks.push(telemetryService.dispose());
    }
    
    if (configManager) {
        try {
            configManager.dispose();
        } catch (error) {
            console.warn('Failed to dispose config manager:', error);
        }
    }
    
    // Wait for all cleanup tasks to complete
    await Promise.allSettled(cleanupTasks);
    
    console.log('✅ Semantic Tagging extension deactivated');
}