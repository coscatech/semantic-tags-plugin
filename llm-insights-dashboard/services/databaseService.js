const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseService {
    constructor() {
        this.dbPath = process.env.DATABASE_PATH || './data/insights.db';
        this.db = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Open database connection
            this.db = new sqlite3.Database(this.dbPath);
            
            // Create tables
            await this.createTables();
            
            this.isInitialized = true;
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createInsightsTable = `
                CREATE TABLE IF NOT EXISTS insights (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    timeframe TEXT NOT NULL,
                    insights TEXT NOT NULL,
                    raw_data TEXT,
                    trends TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createAlertsTable = `
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    details TEXT,
                    action TEXT,
                    status TEXT DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    resolved_at DATETIME
                )
            `;

            const createReportsTable = `
                CREATE TABLE IF NOT EXISTS reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    timeframe TEXT NOT NULL,
                    format TEXT NOT NULL,
                    file_path TEXT,
                    summary TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createMetricsTable = `
                CREATE TABLE IF NOT EXISTS metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    metric_type TEXT NOT NULL,
                    timeframe TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.serialize(() => {
                this.db.run(createInsightsTable);
                this.db.run(createAlertsTable);
                this.db.run(createReportsTable);
                this.db.run(createMetricsTable, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async saveInsights(insights) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO insights (timestamp, timeframe, insights, raw_data, trends)
                VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run([
                insights.timestamp,
                insights.timeframe,
                JSON.stringify(insights.insights),
                JSON.stringify(insights.rawData),
                JSON.stringify(insights.trends)
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });

            stmt.finalize();
        });
    }

    async getLatestInsights(limit = 1) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM insights 
                ORDER BY created_at DESC 
                LIMIT ?
            `, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const insights = rows.map(row => ({
                        id: row.id,
                        timestamp: row.timestamp,
                        timeframe: row.timeframe,
                        insights: JSON.parse(row.insights),
                        rawData: JSON.parse(row.raw_data || '{}'),
                        trends: JSON.parse(row.trends || '{}'),
                        createdAt: row.created_at
                    }));
                    resolve(limit === 1 ? insights[0] : insights);
                }
            });
        });
    }

    async getInsightsHistory(limit = 10) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT id, timestamp, timeframe, created_at,
                       json_extract(insights, '$.summary') as summary
                FROM insights 
                ORDER BY created_at DESC 
                LIMIT ?
            `, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async saveAlert(alert) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO alerts (type, severity, title, description, details, action)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            stmt.run([
                alert.type,
                alert.severity,
                alert.title,
                alert.description,
                JSON.stringify(alert.details),
                alert.action
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });

            stmt.finalize();
        });
    }

    async getActiveAlerts() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM alerts 
                WHERE status = 'active' 
                ORDER BY created_at DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const alerts = rows.map(row => ({
                        ...row,
                        details: JSON.parse(row.details || '{}')
                    }));
                    resolve(alerts);
                }
            });
        });
    }

    async saveReport(report) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO reports (type, timeframe, format, file_path, summary)
                VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run([
                report.type,
                report.timeframe,
                report.format,
                report.filePath,
                report.summary
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });

            stmt.finalize();
        });
    }

    async saveMetric(metricName, value, type, timeframe) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO metrics (metric_name, metric_value, metric_type, timeframe, timestamp)
                VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run([
                metricName,
                value,
                type,
                timeframe,
                new Date().toISOString()
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });

            stmt.finalize();
        });
    }

    async getMetrics(metricName, timeframe, limit = 100) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM metrics 
                WHERE metric_name = ? AND timeframe = ?
                ORDER BY created_at DESC 
                LIMIT ?
            `, [metricName, timeframe, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async cleanup(daysToKeep = 90) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffISO = cutoffDate.toISOString();

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('DELETE FROM insights WHERE created_at < ?', [cutoffISO]);
                this.db.run('DELETE FROM alerts WHERE status = "resolved" AND resolved_at < ?', [cutoffISO]);
                this.db.run('DELETE FROM reports WHERE created_at < ?', [cutoffISO]);
                this.db.run('DELETE FROM metrics WHERE created_at < ?', [cutoffISO], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async close() {
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                    }
                    resolve();
                });
            });
        }
    }

    isHealthy() {
        return this.isInitialized && this.db !== null;
    }
}

module.exports = DatabaseService;