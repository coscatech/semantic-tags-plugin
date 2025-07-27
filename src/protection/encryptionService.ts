import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export class EncryptionService {
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly KEY_LENGTH = 32;
    private static readonly IV_LENGTH = 16;
    private static readonly TAG_LENGTH = 16;

    private encryptionKey: Buffer;

    constructor() {
        this.encryptionKey = this.getOrCreateEncryptionKey();
    }

    private getOrCreateEncryptionKey(): Buffer {
        const keyPath = path.join(__dirname, '../../.encryption-key');
        
        try {
            if (fs.existsSync(keyPath)) {
                return fs.readFileSync(keyPath);
            }
        } catch (error) {
            // Key file doesn't exist or can't be read, create new one
        }

        // Generate new encryption key
        const key = crypto.randomBytes(EncryptionService.KEY_LENGTH);
        
        try {
            // Save key with restricted permissions
            fs.writeFileSync(keyPath, key, { mode: 0o600 });
        } catch (error) {
            console.warn('Could not save encryption key to file, using in-memory key');
        }

        return key;
    }

    encryptData(data: string): string {
        const iv = crypto.randomBytes(EncryptionService.IV_LENGTH);
        const cipher = crypto.createCipherGCM(EncryptionService.ALGORITHM, this.encryptionKey, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        // Combine IV, tag, and encrypted data
        return iv.toString('hex') + tag.toString('hex') + encrypted;
    }

    decryptData(encryptedData: string): string {
        const ivHex = encryptedData.slice(0, EncryptionService.IV_LENGTH * 2);
        const tagHex = encryptedData.slice(EncryptionService.IV_LENGTH * 2, (EncryptionService.IV_LENGTH + EncryptionService.TAG_LENGTH) * 2);
        const encrypted = encryptedData.slice((EncryptionService.IV_LENGTH + EncryptionService.TAG_LENGTH) * 2);
        
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        
        const decipher = crypto.createDecipherGCM(EncryptionService.ALGORITHM, this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    encryptObject<T>(obj: T): string {
        return this.encryptData(JSON.stringify(obj));
    }

    decryptObject<T>(encryptedData: string): T {
        const decryptedJson = this.decryptData(encryptedData);
        return JSON.parse(decryptedJson);
    }

    hashData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    generateSecureToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }
}

export const encryptionService = new EncryptionService();