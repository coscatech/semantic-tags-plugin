/**
 * Python Language-Specific Semantic Analysis
 * Uses regex patterns optimized for Python syntax
 */
import { SemanticTag } from '../semantic-engine';
export interface PythonSemanticTag extends SemanticTag {
    pythonContext?: {
        isInClass?: boolean;
        isInFunction?: boolean;
        indentLevel?: number;
        decorators?: string[];
    };
}
export declare class PythonAnalyzer {
    private customPatterns;
    constructor(customPatterns?: PythonCustomPattern[]);
    /**
     * Analyze Python code with language-specific patterns
     */
    analyze(code: string): PythonSemanticTag[];
    /**
     * Add custom Python patterns
     */
    addCustomPatterns(patterns: PythonCustomPattern[]): void;
    private getLineContext;
    private findMatches;
}
interface PythonContext {
    isInClass: boolean;
    isInFunction: boolean;
    indentLevel: number;
    decorators: string[];
}
interface PythonCustomPattern {
    type: string;
    label: string;
    pattern: RegExp;
    confidence: number;
    category: 'infrastructure' | 'purpose' | 'general' | 'custom';
    contextFilter?: (context: PythonContext) => boolean;
}
export declare const PYTHON_INFRASTRUCTURE_PATTERNS: PythonCustomPattern[];
export declare function createPythonAnalyzer(customPatterns?: PythonCustomPattern[]): PythonAnalyzer;
export {};
//# sourceMappingURL=python.d.ts.map