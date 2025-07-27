/**
 * TypeScript/JavaScript Language-Specific Semantic Analysis
 */
import { ASTAnalyzer, CustomTagDefinition, ASTSemanticTag } from '../ast-analyzer';
export declare class TypeScriptAnalyzer extends ASTAnalyzer {
    constructor();
    /**
     * Analyze TypeScript/JavaScript with language-specific patterns
     */
    analyze(code: string, fileName?: string): ASTSemanticTag[];
    /**
     * Detect React/Next.js patterns
     */
    private detectReactPatterns;
    /**
     * Detect Node.js/Express patterns
     */
    private detectNodePatterns;
}
export declare const TYPESCRIPT_CUSTOM_TAGS: CustomTagDefinition[];
export declare function createTypeScriptAnalyzer(): TypeScriptAnalyzer;
//# sourceMappingURL=typescript.d.ts.map