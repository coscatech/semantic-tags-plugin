import { encryptionService } from './encryptionService';

export interface ObfuscatedPattern {
    id: string;
    encrypted: string;
    checksum: string;
}

export class PatternObfuscator {
    private static readonly OBFUSCATION_SALT = 'COSCA_SEMANTIC_PATTERNS_V1';

    static obfuscatePatterns(patterns: any[]): ObfuscatedPattern[] {
        return patterns.map((pattern, index) => {
            const patternData = {
                ...pattern,
                _salt: PatternObfuscator.OBFUSCATION_SALT,
                _index: index
            };

            const serialized = JSON.stringify(patternData);
            const encrypted = encryptionService.encryptData(serialized);
            const checksum = encryptionService.hashData(serialized);

            return {
                id: encryptionService.generateSecureToken(16),
                encrypted,
                checksum
            };
        });
    }

    static deobfuscatePatterns(obfuscatedPatterns: ObfuscatedPattern[]): any[] {
        return obfuscatedPatterns.map(obfuscated => {
            try {
                const decrypted = encryptionService.decryptData(obfuscated.encrypted);
                const patternData = JSON.parse(decrypted);

                // Verify integrity
                const expectedChecksum = encryptionService.hashData(decrypted);
                if (expectedChecksum !== obfuscated.checksum) {
                    throw new Error('Pattern integrity check failed');
                }

                // Verify salt
                if (patternData._salt !== PatternObfuscator.OBFUSCATION_SALT) {
                    throw new Error('Invalid pattern salt');
                }

                // Remove obfuscation metadata
                const { _salt, _index, ...cleanPattern } = patternData;
                return cleanPattern;
            } catch (error) {
                console.error('Failed to deobfuscate pattern:', error);
                return null;
            }
        }).filter(pattern => pattern !== null);
    }

    static obfuscateCode(code: string): string {
        // Simple code obfuscation - replace meaningful names with hashed versions
        const identifierMap = new Map<string, string>();
        
        // Find all identifiers and create obfuscated versions
        const identifierRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        let match;
        
        while ((match = identifierRegex.exec(code)) !== null) {
            const identifier = match[1];
            
            // Skip common keywords and built-ins
            if (this.isReservedWord(identifier)) {
                continue;
            }
            
            if (!identifierMap.has(identifier)) {
                const hash = encryptionService.hashData(identifier).substring(0, 8);
                identifierMap.set(identifier, `_${hash}`);
            }
        }
        
        // Replace identifiers with obfuscated versions
        let obfuscatedCode = code;
        for (const [original, obfuscated] of identifierMap) {
            const regex = new RegExp(`\\b${original}\\b`, 'g');
            obfuscatedCode = obfuscatedCode.replace(regex, obfuscated);
        }
        
        return obfuscatedCode;
    }

    private static isReservedWord(word: string): boolean {
        const reserved = [
            // JavaScript/TypeScript keywords
            'const', 'let', 'var', 'function', 'class', 'interface', 'type',
            'import', 'export', 'from', 'as', 'default', 'async', 'await',
            'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
            'continue', 'return', 'try', 'catch', 'finally', 'throw',
            'new', 'this', 'super', 'extends', 'implements', 'static',
            'public', 'private', 'protected', 'readonly', 'abstract',
            
            // Common built-ins
            'console', 'window', 'document', 'process', 'require',
            'module', 'exports', 'global', 'Buffer', 'Promise',
            
            // VSCode API
            'vscode', 'TextDocument', 'TextEditor', 'Range', 'Position',
            'DecorationOptions', 'Disposable', 'ExtensionContext'
        ];
        
        return reserved.includes(word) || word.length <= 2;
    }
}

export class RuntimeProtection {
    private static readonly MAX_EXECUTION_TIME = 5000; // 5 seconds
    private static readonly MAX_MEMORY_USAGE = 100 * 1024 * 1024; // 100MB
    
    static wrapFunction<T extends (...args: any[]) => any>(
        fn: T,
        name: string = 'protected_function'
    ): T {
        return ((...args: any[]) => {
            const startTime = Date.now();
            const startMemory = process.memoryUsage().heapUsed;
            
            try {
                // Set up timeout
                const timeoutId = setTimeout(() => {
                    throw new Error(`Function ${name} exceeded maximum execution time`);
                }, RuntimeProtection.MAX_EXECUTION_TIME);
                
                const result = fn(...args);
                
                clearTimeout(timeoutId);
                
                // Check memory usage
                const endMemory = process.memoryUsage().heapUsed;
                const memoryDelta = endMemory - startMemory;
                
                if (memoryDelta > RuntimeProtection.MAX_MEMORY_USAGE) {
                    console.warn(`Function ${name} used excessive memory: ${memoryDelta} bytes`);
                }
                
                return result;
            } catch (error) {
                console.error(`Protected function ${name} failed:`, error);
                throw error;
            }
        }) as T;
    }
    
    static validateInput(input: any, schema: any): boolean {
        // Basic input validation to prevent injection attacks
        if (typeof input === 'string') {
            // Check for suspicious patterns
            const suspiciousPatterns = [
                /<script/i,
                /javascript:/i,
                /eval\(/i,
                /function\s*\(/i,
                /require\s*\(/i,
                /import\s+/i
            ];
            
            return !suspiciousPatterns.some(pattern => pattern.test(input));
        }
        
        return true;
    }
}

export const patternObfuscator = new PatternObfuscator();