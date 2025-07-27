const OpenAI = require('openai');

class RecommendationService {
    constructor(posthogService, llmService) {
        this.posthogService = posthogService;
        this.llmService = llmService;
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async generateCodeQualityRecommendations(timeframe = '7d') {
        try {
            const data = await this.posthogService.getSemanticTaggingData(timeframe);
            
            const prompt = `
            Analyze this semantic tagging data and provide specific code quality recommendations:

            Data Summary:
            - Total tags detected: ${data.totalTags}
            - Most common patterns: ${JSON.stringify(data.topPatterns)}
            - Error patterns: ${JSON.stringify(data.errorPatterns)}
            - Performance issues: ${JSON.stringify(data.performanceIssues)}

            Provide 5-7 actionable recommendations in this JSON format:
            {
                "recommendations": [
                    {
                        "category": "performance|security|maintainability|architecture",
                        "priority": "high|medium|low",
                        "title": "Brief title",
                        "description": "Detailed description",
                        "impact": "Expected impact",
                        "implementation": "How to implement",
                        "metrics": ["metric1", "metric2"]
                    }
                ]
            }
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error generating code quality recommendations:', error);
            throw error;
        }
    }

    async generateArchitecturalInsights(timeframe = '30d') {
        try {
            const data = await this.posthogService.getSemanticTaggingData(timeframe);
            
            const prompt = `
            Based on this semantic tagging data, analyze the architectural patterns and provide insights:

            Architecture Data:
            - Infrastructure patterns: ${JSON.stringify(data.infrastructurePatterns)}
            - Service patterns: ${JSON.stringify(data.servicePatterns)}
            - Data flow patterns: ${JSON.stringify(data.dataFlowPatterns)}
            - Integration patterns: ${JSON.stringify(data.integrationPatterns)}

            Provide architectural insights in this JSON format:
            {
                "insights": [
                    {
                        "type": "pattern|antipattern|opportunity|risk",
                        "title": "Insight title",
                        "description": "Detailed analysis",
                        "evidence": ["supporting evidence"],
                        "recommendations": ["specific actions"],
                        "complexity": "low|medium|high",
                        "timeline": "immediate|short-term|long-term"
                    }
                ],
                "architecturalHealth": {
                    "score": 85,
                    "strengths": ["strength1", "strength2"],
                    "weaknesses": ["weakness1", "weakness2"],
                    "trends": ["trend1", "trend2"]
                }
            }
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error generating architectural insights:', error);
            throw error;
        }
    }

    async generateDeveloperProductivityInsights(timeframe = '14d') {
        try {
            const data = await this.posthogService.getSemanticTaggingData(timeframe);
            
            const prompt = `
            Analyze developer productivity based on semantic tagging patterns:

            Productivity Data:
            - Tag creation velocity: ${data.tagVelocity}
            - Pattern complexity trends: ${JSON.stringify(data.complexityTrends)}
            - Error resolution patterns: ${JSON.stringify(data.errorResolution)}
            - Refactoring patterns: ${JSON.stringify(data.refactoringPatterns)}

            Provide productivity insights in this JSON format:
            {
                "productivityScore": 78,
                "insights": [
                    {
                        "category": "velocity|quality|collaboration|learning",
                        "finding": "Key finding",
                        "impact": "Impact on productivity",
                        "suggestions": ["actionable suggestions"],
                        "metrics": ["relevant metrics to track"]
                    }
                ],
                "trends": {
                    "positive": ["improving areas"],
                    "concerning": ["areas needing attention"],
                    "stable": ["consistent areas"]
                },
                "recommendations": {
                    "immediate": ["quick wins"],
                    "strategic": ["long-term improvements"]
                }
            }
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error generating productivity insights:', error);
            throw error;
        }
    }

    async generateSecurityRecommendations(timeframe = '7d') {
        try {
            const data = await this.posthogService.getSemanticTaggingData(timeframe);
            
            const prompt = `
            Analyze security patterns from semantic tagging data:

            Security Data:
            - Authentication patterns: ${JSON.stringify(data.authPatterns)}
            - Data handling patterns: ${JSON.stringify(data.dataHandlingPatterns)}
            - API security patterns: ${JSON.stringify(data.apiSecurityPatterns)}
            - Vulnerability indicators: ${JSON.stringify(data.vulnerabilityIndicators)}

            Provide security recommendations in this JSON format:
            {
                "securityScore": 82,
                "recommendations": [
                    {
                        "severity": "critical|high|medium|low",
                        "category": "authentication|authorization|data-protection|api-security|infrastructure",
                        "title": "Security recommendation",
                        "description": "Detailed description",
                        "riskLevel": "high|medium|low",
                        "effort": "low|medium|high",
                        "implementation": "Step-by-step implementation",
                        "validation": "How to validate the fix"
                    }
                ],
                "securityTrends": {
                    "improving": ["areas getting better"],
                    "degrading": ["areas getting worse"],
                    "newRisks": ["emerging security risks"]
                }
            }
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error generating security recommendations:', error);
            throw error;
        }
    }

    async generatePersonalizedRecommendations(userId, timeframe = '30d') {
        try {
            const userData = await this.posthogService.getUserSemanticData(userId, timeframe);
            
            const prompt = `
            Generate personalized recommendations for this developer:

            Developer Data:
            - Coding patterns: ${JSON.stringify(userData.patterns)}
            - Skill areas: ${JSON.stringify(userData.skillAreas)}
            - Common mistakes: ${JSON.stringify(userData.commonMistakes)}
            - Growth areas: ${JSON.stringify(userData.growthAreas)}
            - Preferred technologies: ${JSON.stringify(userData.technologies)}

            Provide personalized recommendations in this JSON format:
            {
                "developerProfile": {
                    "level": "junior|mid|senior|expert",
                    "strengths": ["strength1", "strength2"],
                    "growthAreas": ["area1", "area2"],
                    "learningStyle": "visual|hands-on|theoretical|collaborative"
                },
                "recommendations": [
                    {
                        "type": "learning|practice|tooling|process",
                        "title": "Recommendation title",
                        "description": "Why this matters for you",
                        "actionItems": ["specific actions"],
                        "resources": ["helpful resources"],
                        "timeframe": "1-2 weeks|1 month|3 months",
                        "difficulty": "easy|moderate|challenging"
                    }
                ],
                "nextSteps": {
                    "thisWeek": ["immediate actions"],
                    "thisMonth": ["short-term goals"],
                    "thisQuarter": ["longer-term objectives"]
                }
            }
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error generating personalized recommendations:', error);
            throw error;
        }
    }

    async generateTechnicalDebtAnalysis(timeframe = '90d') {
        try {
            const data = await this.posthogService.getSemanticTaggingData(timeframe);
            
            const prompt = `
            Analyze technical debt based on semantic tagging patterns:

            Technical Debt Indicators:
            - Code complexity trends: ${JSON.stringify(data.complexityTrends)}
            - Refactoring frequency: ${data.refactoringFrequency}
            - Legacy pattern usage: ${JSON.stringify(data.legacyPatterns)}
            - Maintenance burden indicators: ${JSON.stringify(data.maintenanceBurden)}

            Provide technical debt analysis in this JSON format:
            {
                "debtScore": 65,
                "analysis": [
                    {
                        "area": "codebase area",
                        "debtLevel": "low|medium|high|critical",
                        "description": "What the debt looks like",
                        "impact": "Business and technical impact",
                        "effort": "Estimated effort to address",
                        "priority": "Priority level",
                        "strategy": "Recommended approach"
                    }
                ],
                "trends": {
                    "increasing": ["areas where debt is growing"],
                    "decreasing": ["areas where debt is being paid down"],
                    "stable": ["areas with consistent debt levels"]
                },
                "recommendations": {
                    "quickWins": ["low-effort, high-impact items"],
                    "strategic": ["larger initiatives"],
                    "preventive": ["measures to prevent future debt"]
                }
            }
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error generating technical debt analysis:', error);
            throw error;
        }
    }

    isHealthy() {
        return this.openai && process.env.OPENAI_API_KEY;
    }
}

module.exports = RecommendationService;