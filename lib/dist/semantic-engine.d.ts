/**
 * COSCA Semantic Analysis Engine
 * Core infrastructure pattern detection and purpose-driven metadata analysis
 */
export interface SemanticTag {
    type: string;
    label: string;
    line: number;
    column: number;
    length: number;
    confidence: number;
    match: string;
}
export interface AnalysisResult {
    totalTags: number;
    tags: SemanticTag[];
    tagCounts: Record<string, number>;
    infraTagCount: number;
    isInfraFile: boolean;
    hasPurposeMetadata: boolean;
    coscaReadinessScore: number;
    insights: {
        topPatterns: [string, number][];
        purposeTags: number;
        expiryTags: number;
        ownerTags: number;
    };
}
export interface PatternConfig {
    pattern: RegExp;
    type: string;
    label: string;
    category: 'infrastructure' | 'purpose' | 'general';
}
export declare class SemanticEngine {
    private patterns;
    constructor(customPatterns?: PatternConfig[]);
    /**
     * Analyze text content for semantic patterns
     */
    analyze(text: string, options?: {
        languageId?: string;
        minConfidence?: number;
    }): AnalysisResult;
    /**
     * Analyze file content with automatic language detection
     */
    analyzeFile(filePath: string, content: string): AnalysisResult;
    private getDefaultPatterns;
    private extractTags;
    private findMatches;
    private generateAnalysis;
    private calculateTagCounts;
    private detectLanguage;
}
export declare function analyzeCode(text: string, options?: {
    languageId?: string;
    minConfidence?: number;
}): AnalysisResult;
export declare function analyzeFile(filePath: string, content: string): AnalysisResult;
export declare const semanticEngine: SemanticEngine;
//# sourceMappingURL=semantic-engine.d.ts.map