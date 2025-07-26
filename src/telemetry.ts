import * as vscode from 'vscode';
import { PostHog } from 'posthog-node';
import { SemanticTag } from './semanticTagger';

export class TelemetryService {
    private posthog: PostHog | null = null;
    private sessionId: string;
    private isInitialized: boolean = false;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.initializePostHog();
    }

    private initializePostHog(): void {
        const config = vscode.workspace.getConfiguration('semanticTagging');
        const telemetryEnabled = config.get<boolean>('enableTelemetry', false);

        console.log('Semantic Tagging: Telemetry enabled:', telemetryEnabled);

        if (telemetryEnabled) {
            try {
                // Replace with your actual PostHog API key
                this.posthog = new PostHog('phc_QoS8jgQeFmZyZ9zktO2P49DseXvcj1Ai5IWww6O4URG', {
                    host: 'https://app.posthog.com',
                    flushAt: 1, // Send events immediately for testing
                    flushInterval: 1000 // Flush every second
                });
                this.isInitialized = true;
                console.log('Semantic Tagging: PostHog initialized successfully');
            } catch (error) {
                console.error('Semantic Tagging: Failed to initialize PostHog:', error);
                this.posthog = null;
            }
        }
    }

    trackScan(languageId: string, tags: SemanticTag[]): void {
        if (!this.posthog || !this.isInitialized) {
            console.log('Semantic Tagging: PostHog not available, skipping telemetry');
            return;
        }

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

        const eventData = {
            distinctId: this.sessionId,
            event: 'semantic_scan',
            properties: {
                language: languageId,
                total_tags: tags.length,
                tag_counts: tagCounts,
                // COSCA-specific metrics
                infra_tag_count: infraTagCount,
                is_infra_file: isInfraFile,
                has_purpose_metadata: hasPurposeMetadata,
                purpose_tags: purposeTags,
                expiry_tags: expiryTags,
                owner_tags: ownerTags,
                // Cloud provider detection
                aws_tags: (tagCounts['cloud'] || 0),
                iac_tags: (tagCounts['iac'] || 0),
                container_tags: (tagCounts['container'] || 0),
                timestamp: new Date().toISOString(),
                session_id: this.sessionId
            }
        };

        console.log('Semantic Tagging: Sending telemetry event:', eventData);

        try {
            this.posthog.capture(eventData);
            console.log('Semantic Tagging: Telemetry event sent successfully');
        } catch (error) {
            console.error('Semantic Tagging: Failed to send telemetry:', error);
        }
    }

    trackExtensionActivated(): void {
        if (!this.posthog || !this.isInitialized) return;

        try {
            this.posthog.capture({
                distinctId: this.sessionId,
                event: 'extension_activated',
                properties: {
                    timestamp: new Date().toISOString(),
                    session_id: this.sessionId,
                    vscode_version: vscode.version
                }
            });
            console.log('Semantic Tagging: Extension activation tracked');
        } catch (error) {
            console.error('Semantic Tagging: Failed to track activation:', error);
        }
    }

    private generateSessionId(): string {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    dispose(): void {
        if (this.posthog) {
            console.log('Semantic Tagging: Shutting down PostHog');
            this.posthog.shutdown();
        }
    }
}