import * as vscode from 'vscode';
import { PostHog } from 'posthog-node';
import { SemanticTag } from './semanticTagger';
import { configManager, ExtensionConfig } from './config';
import { RetryManager, CircuitBreaker, ErrorClassifier, ExtensionError } from './utils/errorHandling';

interface TelemetryEvent {
    distinctId: string;
    event: string;
    properties: Record<string, any>;
    timestamp: string;
}

interface TelemetryResult {
    success: boolean;
    error?: ExtensionError;
    retryable: boolean;
}

export class TelemetryService {
    private posthog: PostHog | null = null;
    private sessionId: string;
    private isInitialized: boolean = false;
    private config: ExtensionConfig;
    private eventBatch: TelemetryEvent[] = [];
    private batchTimer: NodeJS.Timeout | null = null;
    private circuitBreaker: CircuitBreaker;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.sessionId = this.generateSessionId();
        this.config = configManager.getConfig();
        this.circuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 1 minute recovery
        this.initializePostHog();
        this.setupConfigListener();
    }

    private setupConfigListener(): void {
        const disposable = vscode.commands.registerCommand('semanticTagging.configChanged', (newConfig: ExtensionConfig) => {
            this.config = newConfig;
            this.reinitializePostHog();
        });
        this.disposables.push(disposable);
    }

    private initializePostHog(): void {
        console.log('🔍 Semantic Tagging: Telemetry enabled:', this.config.telemetry.enabled);
        
        if (this.config.telemetry.enabled) {
            console.log('📊 TRANSPARENCY: We track tag types, not code content');
            console.log('   ✅ Collected: Pattern counts (iac: 3, purpose: 2, etc.)');
            console.log('   ❌ Never collected: Your actual code, file names, or personal data');
            
            try {
                // Validate API key
                if (!this.config.telemetry.apiKey || !this.config.telemetry.apiKey.startsWith('phc_')) {
                    throw new Error('Invalid PostHog API key format');
                }
                
                this.posthog = new PostHog(this.config.telemetry.apiKey, {
                    host: this.config.telemetry.host,
                    flushAt: this.config.telemetry.batchSize,
                    flushInterval: this.config.telemetry.flushInterval
                });
                this.isInitialized = true;
                console.log(`✅ Semantic Tagging: Telemetry initialized (${this.config.telemetry.host})`);
                
                const isCustomInstance = this.config.telemetry.apiKey !== 'phc_QoS8jgQeFmZyZ9zktO2P49DseXvcj1Ai5IWww6O4URG';
                if (isCustomInstance) {
                    console.log('🏢 Using custom PostHog instance for team telemetry');
                } else {
                    console.log('☁️ Using COSCA cloud telemetry to improve semantic patterns');
                }
            } catch (error) {
                const classifiedError = ErrorClassifier.classify(error);
                console.error('❌ Semantic Tagging: Failed to initialize telemetry:', classifiedError.message);
                this.posthog = null;
                this.isInitialized = false;
            }
        } else {
            console.log('🔒 Semantic Tagging: Telemetry disabled - no data collected');
        }
    }

    private reinitializePostHog(): void {
        if (this.posthog) {
            this.posthog.shutdown();
            this.posthog = null;
        }
        this.isInitialized = false;
        this.initializePostHog();
    }

    async trackScan(languageId: string, tags: SemanticTag[]): Promise<TelemetryResult> {
        if (!this.config.telemetry.enabled || !this.isInitialized) {
            return { success: false, error: undefined, retryable: false };
        }

        try {
            // Validate input
            if (!languageId || !Array.isArray(tags)) {
                throw new Error('Invalid input parameters for trackScan');
            }

            const sanitizedData = this.sanitizeEventData(languageId, tags);
            const event: TelemetryEvent = {
                distinctId: this.sessionId,
                event: 'semantic_scan',
                properties: sanitizedData,
                timestamp: new Date().toISOString()
            };

            await this.addToBatch(event);
            
            console.log('📊 Pattern data queued for telemetry:', {
                language: sanitizedData.language,
                totalTags: sanitizedData.total_tags,
                infraTags: sanitizedData.infra_tag_count,
                hasPurpose: sanitizedData.has_purpose_metadata
            });

            return { success: true, retryable: false };
        } catch (error) {
            const classifiedError = ErrorClassifier.classify(error);
            console.error('❌ Failed to queue pattern data:', classifiedError.message);
            return { success: false, error: classifiedError, retryable: classifiedError.retryable };
        }
    }

    private sanitizeEventData(languageId: string, tags: SemanticTag[]): Record<string, any> {
        // Sanitize language ID to prevent PII
        const sanitizedLanguageId = this.sanitizeLanguageId(languageId);
        
        const tagCounts = tags.reduce((acc, tag) => {
            acc[tag.type] = (acc[tag.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Infrastructure-specific insights
        const infraTags = ['iac', 'cloud', 'container', 'compute', 'storage', 'observability', 'lifecycle', 'cost', 'security', 'ml_infra'];
        const infraTagCount = infraTags.reduce((sum, type) => sum + (tagCounts[type] || 0), 0);
        const isInfraFile = infraTagCount > 0;
        
        // Purpose-driven insights
        const purposeTags = tagCounts['purpose'] || 0;
        const expiryTags = tagCounts['expiry'] || 0;
        const ownerTags = tagCounts['owner'] || 0;
        const hasPurposeMetadata = purposeTags > 0 || expiryTags > 0 || ownerTags > 0;

        return {
            language: sanitizedLanguageId,
            total_tags: Math.min(tags.length, 10000), // Cap at reasonable limit
            tag_counts: tagCounts,
            infra_tag_count: infraTagCount,
            is_infra_file: isInfraFile,
            has_purpose_metadata: hasPurposeMetadata,
            purpose_tags: purposeTags,
            expiry_tags: expiryTags,
            owner_tags: ownerTags,
            aws_tags: (tagCounts['cloud'] || 0),
            iac_tags: (tagCounts['iac'] || 0),
            container_tags: (tagCounts['container'] || 0),
            session_id: this.sessionId
        };
    }

    private sanitizeLanguageId(languageId: string): string {
        // Only allow known language IDs to prevent PII leakage
        const allowedLanguages = [
            'terraform', 'yaml', 'javascript', 'typescript', 'python', 
            'go', 'java', 'csharp', 'cpp', 'rust', 'json', 'dockerfile', 'unknown'
        ];
        
        return allowedLanguages.includes(languageId.toLowerCase()) ? languageId.toLowerCase() : 'unknown';
    }

    private async addToBatch(event: TelemetryEvent): Promise<void> {
        this.eventBatch.push(event);

        // Flush immediately if batch is full
        if (this.eventBatch.length >= this.config.telemetry.batchSize) {
            await this.flushBatch();
        } else if (!this.batchTimer) {
            // Set timer to flush batch after interval
            this.batchTimer = setTimeout(() => {
                this.flushBatch().catch(error => {
                    console.error('Failed to flush telemetry batch:', error);
                });
            }, this.config.telemetry.flushInterval);
        }
    }

    private async flushBatch(): Promise<void> {
        if (this.eventBatch.length === 0 || !this.posthog) {
            return;
        }

        const batch = [...this.eventBatch];
        this.eventBatch = [];
        
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        try {
            await this.circuitBreaker.execute(async () => {
                await RetryManager.withRetry(async () => {
                    for (const event of batch) {
                        this.posthog!.capture({
                            distinctId: event.distinctId,
                            event: event.event,
                            properties: event.properties
                        });
                    }
                    await this.posthog!.flush();
                }, {
                    maxRetries: this.config.telemetry.maxRetries,
                    baseDelay: this.config.telemetry.retryDelay
                });
            });

            console.log(`✅ Telemetry batch sent successfully (${batch.length} events)`);
        } catch (error) {
            const classifiedError = ErrorClassifier.classify(error);
            console.error(`❌ Failed to send telemetry batch:`, classifiedError.message);
            
            // Re-queue events if retryable
            if (classifiedError.retryable && batch.length < 100) { // Prevent infinite growth
                this.eventBatch.unshift(...batch);
            }
        }
    }

    async trackExtensionActivated(): Promise<TelemetryResult> {
        if (!this.config.telemetry.enabled || !this.isInitialized) {
            return { success: false, error: undefined, retryable: false };
        }

        try {
            const event: TelemetryEvent = {
                distinctId: this.sessionId,
                event: 'extension_activated',
                properties: {
                    session_id: this.sessionId,
                    vscode_version: vscode.version,
                    extension_version: vscode.extensions.getExtension('cosca.semantic-tagging-vscode')?.packageJSON?.version || 'unknown'
                },
                timestamp: new Date().toISOString()
            };

            await this.addToBatch(event);
            console.log('Semantic Tagging: Extension activation tracked');
            return { success: true, retryable: false };
        } catch (error) {
            const classifiedError = ErrorClassifier.classify(error);
            console.error('Semantic Tagging: Failed to track activation:', classifiedError.message);
            return { success: false, error: classifiedError, retryable: classifiedError.retryable };
        }
    }

    private generateSessionId(): string {
        // Generate a truly anonymous session ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `session_${random}_${timestamp}`;
    }

    async dispose(): Promise<void> {
        console.log('Semantic Tagging: Shutting down telemetry service');
        
        // Clear batch timer
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        // Flush any remaining events
        try {
            await this.flushBatch();
        } catch (error) {
            console.warn('Failed to flush final telemetry batch:', error);
        }

        // Dispose of PostHog
        if (this.posthog) {
            try {
                await this.posthog.shutdown();
            } catch (error) {
                console.warn('Failed to shutdown PostHog cleanly:', error);
            }
            this.posthog = null;
        }

        // Dispose of VSCode disposables
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        
        this.isInitialized = false;
    }
}