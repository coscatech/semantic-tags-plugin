/**
 * Centralized configuration management for the semantic tagging extension
 */
import * as vscode from 'vscode';

export interface ExtensionConfig {
    analysis: {
        confidenceThreshold: number;
        maxFileSize: number;
        debounceDelay: number;
        maxCacheSize: number;
        cacheTTL: number;
    };
    telemetry: {
        enabled: boolean;
        batchSize: number;
        flushInterval: number;
        maxRetries: number;
        retryDelay: number;
        host: string;
        apiKey: string;
    };
    performance: {
        maxAnalysisTime: number;
        useWebWorker: boolean;
        webWorkerThreshold: number;
    };
}

export const DEFAULT_CONFIG: ExtensionConfig = {
    analysis: {
        confidenceThreshold: 0.8,      // Based on testing with sample files
        maxFileSize: 1024 * 1024,      // 1MB limit to prevent UI blocking
        debounceDelay: 300,            // 300ms feels responsive
        maxCacheSize: 500,             // Max 500 files cached
        cacheTTL: 1000 * 60 * 10       // 10 minute TTL
    },
    telemetry: {
        enabled: false,                // Opt-in by default
        batchSize: 10,                 // Batch 10 events before sending
        flushInterval: 30000,          // Flush every 30 seconds
        maxRetries: 3,                 // Retry failed requests 3 times
        retryDelay: 1000,              // Start with 1 second delay
        host: 'https://app.posthog.com',
        apiKey: ''                     // Will be set from settings or environment
    },
    performance: {
        maxAnalysisTime: 5000,         // 5 second timeout for analysis
        useWebWorker: true,            // Use web workers for large files
        webWorkerThreshold: 5000       // Use worker for files >5k lines
    }
};

export class ConfigManager {
    private config: ExtensionConfig;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.config = this.loadConfig();
        this.setupConfigWatcher();
    }

    private loadConfig(): ExtensionConfig {
        const vscodeConfig = vscode.workspace.getConfiguration('semanticTagging');
        
        return {
            analysis: {
                confidenceThreshold: vscodeConfig.get('analysis.confidenceThreshold', DEFAULT_CONFIG.analysis.confidenceThreshold),
                maxFileSize: vscodeConfig.get('analysis.maxFileSize', DEFAULT_CONFIG.analysis.maxFileSize),
                debounceDelay: vscodeConfig.get('analysis.debounceDelay', DEFAULT_CONFIG.analysis.debounceDelay),
                maxCacheSize: vscodeConfig.get('analysis.maxCacheSize', DEFAULT_CONFIG.analysis.maxCacheSize),
                cacheTTL: vscodeConfig.get('analysis.cacheTTL', DEFAULT_CONFIG.analysis.cacheTTL)
            },
            telemetry: {
                enabled: vscodeConfig.get('enableTelemetry', DEFAULT_CONFIG.telemetry.enabled),
                batchSize: vscodeConfig.get('telemetry.batchSize', DEFAULT_CONFIG.telemetry.batchSize),
                flushInterval: vscodeConfig.get('telemetry.flushInterval', DEFAULT_CONFIG.telemetry.flushInterval),
                maxRetries: vscodeConfig.get('telemetry.maxRetries', DEFAULT_CONFIG.telemetry.maxRetries),
                retryDelay: vscodeConfig.get('telemetry.retryDelay', DEFAULT_CONFIG.telemetry.retryDelay),
                host: vscodeConfig.get('telemetryHost', DEFAULT_CONFIG.telemetry.host),
                apiKey: vscodeConfig.get('telemetryApiKey', process.env.POSTHOG_API_KEY || 'phc_QoS8jgQeFmZyZ9zktO2P49DseXvcj1Ai5IWww6O4URG')
            },
            performance: {
                maxAnalysisTime: vscodeConfig.get('performance.maxAnalysisTime', DEFAULT_CONFIG.performance.maxAnalysisTime),
                useWebWorker: vscodeConfig.get('performance.useWebWorker', DEFAULT_CONFIG.performance.useWebWorker),
                webWorkerThreshold: vscodeConfig.get('performance.webWorkerThreshold', DEFAULT_CONFIG.performance.webWorkerThreshold)
            }
        };
    }

    private setupConfigWatcher(): void {
        const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('semanticTagging')) {
                this.config = this.loadConfig();
                this.onConfigChanged();
            }
        });
        
        this.disposables.push(disposable);
    }

    private onConfigChanged(): void {
        // Emit event for components to react to config changes
        vscode.commands.executeCommand('semanticTagging.configChanged', this.config);
    }

    getConfig(): ExtensionConfig {
        return { ...this.config }; // Return a copy to prevent mutations
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}

// Singleton instance
export const configManager = new ConfigManager();