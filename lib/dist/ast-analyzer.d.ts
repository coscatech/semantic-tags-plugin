/**
 * AST-Based Semantic Analysis Engine
 * More accurate than regex-based pattern matching
 */
import * as ts from 'typescript';
export interface ASTSemanticTag {
    type: string;
    label: string;
    line: number;
    column: number;
    length: number;
    confidence: number;
    match: string;
    astNode: string;
    context?: string;
}
export interface CustomTagDefinition {
    name: string;
    description: string;
    matcher: (node: ts.Node, sourceFile: ts.SourceFile) => boolean;
    confidence: number;
    category: 'infrastructure' | 'purpose' | 'general' | 'custom';
}
export declare class ASTAnalyzer {
    private customTags;
    constructor(customTags?: CustomTagDefinition[]);
    /**
     * Analyze TypeScript/JavaScript code using AST
     */
    analyzeTypeScript(code: string, fileName?: string): ASTSemanticTag[];
    /**
     * Add custom tag definitions
     */
    addCustomTags(customTags: CustomTagDefinition[]): void;
    /**
     * Override default tag behavior
     */
    overrideDefaultTags(overrides: Partial<Record<string, CustomTagDefinition>>): void;
    private visitNode;
    private checkInfrastructurePatterns;
    private checkPurposeMetadata;
    private checkGeneralPatterns;
    private checkCustomPatterns;
    private addTag;
}
export declare const INFRASTRUCTURE_CUSTOM_TAGS: CustomTagDefinition[];
export declare function createASTAnalyzer(customTags?: CustomTagDefinition[]): ASTAnalyzer;
//# sourceMappingURL=ast-analyzer.d.ts.map