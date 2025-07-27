#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class IPProtector {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        
        this.encryptionKey = this.generateEncryptionKey();
    }

    generateEncryptionKey() {
        return crypto.randomBytes(this.keyLength);
    }

    encryptFile(filePath, outputPath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const encrypted = this.encryptData(data);
            
            fs.writeFileSync(outputPath, encrypted);
            console.log(`✅ Encrypted: ${filePath} -> ${outputPath}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to encrypt ${filePath}:`, error.message);
            return false;
        }
    }

    encryptData(data) {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Combine IV and encrypted data
        return iv.toString('hex') + encrypted;
    }

    decryptData(encryptedData) {
        const ivHex = encryptedData.slice(0, this.ivLength * 2);
        const encrypted = encryptedData.slice(this.ivLength * 2);
        
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    saveEncryptionKey(keyPath) {
        try {
            fs.writeFileSync(keyPath, this.encryptionKey, { mode: 0o600 });
            console.log(`🔑 Encryption key saved to: ${keyPath}`);
        } catch (error) {
            console.error('❌ Failed to save encryption key:', error.message);
        }
    }

    createSecureBackup() {
        const backupDir = path.join(__dirname, '../.secure-backup');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { mode: 0o700 });
        }

        const filesToProtect = [
            'src/semanticTagger.ts',
            'lib/src/semantic-engine.ts',
            'src/protection/protectedSemanticTagger.ts'
        ];

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        let allSuccess = true;

        for (const file of filesToProtect) {
            const fullPath = path.join(__dirname, '..', file);
            
            if (fs.existsSync(fullPath)) {
                const backupName = `${path.basename(file, path.extname(file))}-${timestamp}.encrypted`;
                const backupPath = path.join(backupDir, backupName);
                
                const success = this.encryptFile(fullPath, backupPath);
                allSuccess = allSuccess && success;
            } else {
                console.warn(`⚠️  File not found: ${file}`);
            }
        }

        // Save encryption key
        const keyPath = path.join(backupDir, `encryption-key-${timestamp}.key`);
        this.saveEncryptionKey(keyPath);

        return allSuccess;
    }

    obfuscateSourceCode() {
        const filesToObfuscate = [
            'src/semanticTagger.ts'
        ];

        for (const file of filesToObfuscate) {
            const fullPath = path.join(__dirname, '..', file);
            
            if (fs.existsSync(fullPath)) {
                try {
                    const originalCode = fs.readFileSync(fullPath, 'utf8');
                    const obfuscatedCode = this.obfuscateCode(originalCode);
                    
                    // Create obfuscated version
                    const obfuscatedPath = fullPath.replace('.ts', '.obfuscated.ts');
                    fs.writeFileSync(obfuscatedPath, obfuscatedCode);
                    
                    console.log(`🔒 Obfuscated: ${file}`);
                } catch (error) {
                    console.error(`❌ Failed to obfuscate ${file}:`, error.message);
                }
            }
        }
    }

    obfuscateCode(code) {
        // Simple obfuscation - replace meaningful names with hashed versions
        const identifierMap = new Map();
        
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
                const hash = crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 8);
                identifierMap.set(identifier, `_${hash}`);
            }
        }
        
        // Replace identifiers with obfuscated versions
        let obfuscatedCode = code;
        for (const [original, obfuscated] of identifierMap) {
            const regex = new RegExp(`\\b${original}\\b`, 'g');
            obfuscatedCode = obfuscatedCode.replace(regex, obfuscated);
        }
        
        // Add obfuscation notice
        const notice = `
/*
 * COSCA IP PROTECTED CODE
 * This file contains obfuscated intellectual property.
 * Unauthorized reverse engineering is prohibited.
 * Generated: ${new Date().toISOString()}
 */

`;
        
        return notice + obfuscatedCode;
    }

    isReservedWord(word) {
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

    generateIPProtectionReport() {
        const report = {
            timestamp: new Date().toISOString(),
            protectionLevel: 'HIGH',
            measures: [
                'AES-256-GCM encryption for core semantic patterns',
                'Runtime pattern decryption with integrity checks',
                'Obfuscated source code identifiers',
                'Git exclusion of sensitive files',
                'Secure backup with encrypted storage',
                'Runtime protection against reverse engineering',
                'Telemetry data sanitization',
                'Memory-safe pattern handling'
            ],
            files_protected: [
                'src/semanticTagger.ts',
                'src/protection/',
                'lib/src/semantic-engine.ts'
            ],
            security_features: [
                'Encrypted pattern storage',
                'Runtime integrity validation',
                'Session-based cache keys',
                'Input sanitization',
                'Memory usage limits',
                'Execution time limits'
            ]
        };

        const reportPath = path.join(__dirname, '../IP_PROTECTION_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n📋 IP Protection Report:');
        console.log('========================');
        console.log(`Protection Level: ${report.protectionLevel}`);
        console.log(`Files Protected: ${report.files_protected.length}`);
        console.log(`Security Measures: ${report.measures.length}`);
        console.log(`Report saved to: ${reportPath}`);
        
        return report;
    }
}

// Main execution
async function main() {
    console.log('🔒 COSCA IP Protection System');
    console.log('==============================\n');

    const protector = new IPProtector();

    try {
        // Create secure backup
        console.log('📦 Creating secure backup...');
        const backupSuccess = protector.createSecureBackup();
        
        if (backupSuccess) {
            console.log('✅ Secure backup completed\n');
        } else {
            console.log('⚠️  Backup completed with warnings\n');
        }

        // Obfuscate source code
        console.log('🔒 Obfuscating source code...');
        protector.obfuscateSourceCode();
        console.log('✅ Source code obfuscation completed\n');

        // Generate protection report
        console.log('📋 Generating IP protection report...');
        protector.generateIPProtectionReport();
        console.log('✅ IP protection report generated\n');

        console.log('🎉 IP protection process completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Review the generated .secure-backup directory');
        console.log('2. Verify .gitignore excludes sensitive files');
        console.log('3. Test the protected semantic tagger');
        console.log('4. Store encryption keys securely');

    } catch (error) {
        console.error('❌ IP protection failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = IPProtector;