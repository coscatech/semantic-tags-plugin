/**
 * LRU Cache implementation for managing semantic tag storage
 */

interface CacheNode<K, V> {
    key: K;
    value: V;
    prev?: CacheNode<K, V>;
    next?: CacheNode<K, V>;
    timestamp: number;
}

export interface CacheOptions {
    maxSize: number;
    ttl?: number; // Time to live in milliseconds
}

export class LRUCache<K, V> {
    private cache = new Map<K, CacheNode<K, V>>();
    private head?: CacheNode<K, V>;
    private tail?: CacheNode<K, V>;
    private readonly maxSize: number;
    private readonly ttl?: number;

    constructor(options: CacheOptions) {
        this.maxSize = options.maxSize;
        this.ttl = options.ttl;
    }

    get(key: K): V | undefined {
        const node = this.cache.get(key);
        
        if (!node) {
            return undefined;
        }

        // Check TTL
        if (this.ttl && Date.now() - node.timestamp > this.ttl) {
            this.delete(key);
            return undefined;
        }

        // Move to front (most recently used)
        this.moveToFront(node);
        return node.value;
    }

    set(key: K, value: V): void {
        const existingNode = this.cache.get(key);
        
        if (existingNode) {
            // Update existing node
            existingNode.value = value;
            existingNode.timestamp = Date.now();
            this.moveToFront(existingNode);
            return;
        }

        // Create new node
        const newNode: CacheNode<K, V> = {
            key,
            value,
            timestamp: Date.now()
        };

        this.cache.set(key, newNode);
        this.addToFront(newNode);

        // Check if we need to evict
        if (this.cache.size > this.maxSize) {
            this.evictLRU();
        }
    }

    delete(key: K): boolean {
        const node = this.cache.get(key);
        
        if (!node) {
            return false;
        }

        this.cache.delete(key);
        this.removeNode(node);
        return true;
    }

    clear(): void {
        this.cache.clear();
        this.head = undefined;
        this.tail = undefined;
    }

    size(): number {
        return this.cache.size;
    }

    has(key: K): boolean {
        const node = this.cache.get(key);
        
        if (!node) {
            return false;
        }

        // Check TTL
        if (this.ttl && Date.now() - node.timestamp > this.ttl) {
            this.delete(key);
            return false;
        }

        return true;
    }

    keys(): K[] {
        const keys: K[] = [];
        let current = this.head;
        
        while (current) {
            // Check TTL
            if (!this.ttl || Date.now() - current.timestamp <= this.ttl) {
                keys.push(current.key);
            }
            current = current.next;
        }
        
        return keys;
    }

    // Clean up expired entries
    cleanup(): number {
        if (!this.ttl) {
            return 0;
        }

        const now = Date.now();
        const keysToDelete: K[] = [];
        
        for (const [key, node] of this.cache) {
            if (now - node.timestamp > this.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));
        return keysToDelete.length;
    }

    private moveToFront(node: CacheNode<K, V>): void {
        if (node === this.head) {
            return;
        }

        this.removeNode(node);
        this.addToFront(node);
    }

    private addToFront(node: CacheNode<K, V>): void {
        if (!this.head) {
            this.head = this.tail = node;
            return;
        }

        node.next = this.head;
        this.head.prev = node;
        this.head = node;
    }

    private removeNode(node: CacheNode<K, V>): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }

        node.prev = node.next = undefined;
    }

    private evictLRU(): void {
        if (!this.tail) {
            return;
        }

        const lru = this.tail;
        this.cache.delete(lru.key);
        this.removeNode(lru);
    }
}

// Cache metrics for monitoring
export class CacheMetrics {
    private hits = 0;
    private misses = 0;
    private evictions = 0;

    recordHit(): void {
        this.hits++;
    }

    recordMiss(): void {
        this.misses++;
    }

    recordEviction(): void {
        this.evictions++;
    }

    getHitRate(): number {
        const total = this.hits + this.misses;
        return total === 0 ? 0 : this.hits / total;
    }

    getStats() {
        return {
            hits: this.hits,
            misses: this.misses,
            evictions: this.evictions,
            hitRate: this.getHitRate()
        };
    }

    reset(): void {
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
    }
}