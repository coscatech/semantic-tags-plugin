/**
 * Comprehensive error handling utilities
 */

export enum ErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ExtensionError {
    type: ErrorType;
    message: string;
    retryable: boolean;
    originalError?: Error;
    context?: Record<string, any>;
}

export class ErrorClassifier {
    static classify(error: Error | any): ExtensionError {
        if (!error) {
            return {
                type: ErrorType.UNKNOWN_ERROR,
                message: 'Unknown error occurred',
                retryable: false
            };
        }

        // Network errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return {
                type: ErrorType.NETWORK_ERROR,
                message: `Network error: ${error.message}`,
                retryable: true,
                originalError: error
            };
        }

        // HTTP errors
        if (error.response) {
            const status = error.response.status;
            if (status === 429) {
                return {
                    type: ErrorType.RATE_LIMIT_ERROR,
                    message: 'Rate limit exceeded',
                    retryable: true,
                    originalError: error
                };
            }
            if (status === 401 || status === 403) {
                return {
                    type: ErrorType.AUTHENTICATION_ERROR,
                    message: 'Authentication failed',
                    retryable: false,
                    originalError: error
                };
            }
            if (status >= 500) {
                return {
                    type: ErrorType.NETWORK_ERROR,
                    message: `Server error: ${status}`,
                    retryable: true,
                    originalError: error
                };
            }
        }

        // Timeout errors
        if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
            return {
                type: ErrorType.TIMEOUT_ERROR,
                message: 'Operation timed out',
                retryable: true,
                originalError: error
            };
        }

        // Validation errors
        if (error.name === 'ValidationError' || error.message?.includes('Invalid')) {
            return {
                type: ErrorType.VALIDATION_ERROR,
                message: error.message,
                retryable: false,
                originalError: error
            };
        }

        return {
            type: ErrorType.UNKNOWN_ERROR,
            message: error.message || 'Unknown error occurred',
            retryable: false,
            originalError: error
        };
    }
}

export interface RetryOptions {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

export class RetryManager {
    private static readonly DEFAULT_OPTIONS: RetryOptions = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2
    };

    static async withRetry<T>(
        operation: () => Promise<T>,
        options: Partial<RetryOptions> = {}
    ): Promise<T> {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        let lastError: ExtensionError;

        for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = ErrorClassifier.classify(error);
                
                if (!lastError.retryable || attempt === opts.maxRetries) {
                    throw lastError;
                }

                const delay = Math.min(
                    opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
                    opts.maxDelay
                );

                console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
                await this.sleep(delay);
            }
        }

        throw lastError!;
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    constructor(
        private readonly failureThreshold: number = 5,
        private readonly recoveryTimeout: number = 60000 // 1 minute
    ) {}

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    private onFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();
        
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }

    getState(): string {
        return this.state;
    }
}