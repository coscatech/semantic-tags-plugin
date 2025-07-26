/**
 * COSCA Semantic Tags - Infrastructure Pattern Analysis
 *
 * Analyzes code for infrastructure patterns and purpose-driven metadata
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
export interface SemanticAnalysisResult {
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
export declare class SemanticAnalyzer {
    private patterns;
    constructor();
    /**
     * Analyze text content for semantic patterns
     */
    analyze(text: string, languageId?: string): SemanticAnalysisResult;
    /**
     * Analyze a file by path
     */
    analyzeFile(filePath: string, content: string): SemanticAnalysisResult;
    /**
     * Get language ID from file extension
     */
    private getLanguageId;
    private extractSemanticTags;
    private findPattern;
    private calculateTagCounts;
}
export declare const semanticAnalyzer: SemanticAnalyzer;
export declare function analyzeCode(text: string, languageId?: string): SemanticAnalysisResult;
export declare function analyzeFile(filePath: string, content: string): SemanticAnalysisResult;
//# sourceMappingURL=index.d.ts.map