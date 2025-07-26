/**
 * COSCA Semantic Analysis Engine
 * Core infrastructure pattern detection without hardcoded examples
 */

// Re-export everything from the semantic engine
export * from './semantic-engine';

// Maintain backward compatibility
export { 
    SemanticEngine as SemanticAnalyzer,
    AnalysisResult as SemanticAnalysisResult 
} from './semantic-engine';