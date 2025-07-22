// 🩺 SYSTEM HEALTH CHECKER
class SystemHealthChecker {
    constructor() {
        this.healthStatus = {};
        this.checkInterval = null;
        this.issues = [];
    }

    startHealthMonitoring() {
        // Immediate check
        this.performHealthCheck();
        
        // Periodic health checks every 30 seconds
        this.checkInterval = setInterval(() => {
            this.performHealthCheck();
        }, 30000);
        
        console.log('🩺 System Health Monitoring started');
    }

    stopHealthMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    performHealthCheck() {
        const timestamp = Date.now();
        this.issues = [];
        
        // Check 1: Core Systems
        const coreSystemsHealth = this.checkCoreSystems();
        
        // Check 2: Data Integrity
        const dataIntegrityHealth = this.checkDataIntegrity();
        
        // Check 3: Performance Metrics
        const performanceHealth = this.checkPerformance();
        
        // Check 4: API Connectivity
        const apiHealth = this.checkAPIConnectivity();
        
        // Check 5: Machine Learning Systems
        const mlHealth = this.checkMLSystems();
        
        this.healthStatus = {
            timestamp,
            overall: this.calculateOverallHealth([
                coreSystemsHealth,
                dataIntegrityHealth, 
                performanceHealth,
                apiHealth,
                mlHealth
            ]),
            systems: {
                core: coreSystemsHealth,
                data: dataIntegrityHealth,
                performance: performanceHealth,
                api: apiHealth,
                ml: mlHealth
            },
            issues: this.issues
        };
        
        // Log critical issues
        this.logCriticalIssues();
        
        // Update debug panel if available
        if (typeof DebugPanel !== 'undefined') {
            DebugPanel.logInfo(`Health Check: ${this.healthStatus.overall}% overall health`);
        }
        
        return this.healthStatus;
    }

    checkCoreSystems() {
        let score = 100;
        
        // TradingDashboard
        if (typeof TradingDashboard === 'undefined') {
            this.addIssue('CRITICAL', 'TradingDashboard class not loaded');
            score -= 30;
        }
        
        // Dashboard instance
        if (typeof window.dashboard === 'undefined') {
            this.addIssue('CRITICAL', 'Dashboard instance not created');
            score -= 30;
        }
        
        // Chart.js
        if (typeof Chart === 'undefined') {
            this.addIssue('HIGH', 'Chart.js library not loaded');
            score -= 20;
        }
        
        // MLAccuracyEnhancer
        if (typeof MLAccuracyEnhancer === 'undefined') {
            this.addIssue('MEDIUM', 'ML Accuracy Enhancer not loaded');
            score -= 10;
        }
        
        // DebugPanel
        if (typeof DebugPanel === 'undefined') {
            this.addIssue('LOW', 'Debug Panel not loaded');
            score -= 5;
        }
        
        return Math.max(0, score);
    }

    checkDataIntegrity() {
        let score = 100;
        
        // LocalStorage functionality
        try {
            localStorage.setItem('healthCheck', 'test');
            localStorage.removeItem('healthCheck');
        } catch (e) {
            this.addIssue('CRITICAL', 'LocalStorage not accessible');
            score -= 40;
        }
        
        // Prediction History
        const predictionHistory = localStorage.getItem('predictionHistory');
        if (!predictionHistory) {
            this.addIssue('MEDIUM', 'No prediction history found');
            score -= 15;
        } else {
            try {
                const parsed = JSON.parse(predictionHistory);
                if (Object.keys(parsed).length === 0) {
                    this.addIssue('MEDIUM', 'Empty prediction history');
                    score -= 10;
                }
            } catch (e) {
                this.addIssue('HIGH', 'Corrupted prediction history');
                score -= 25;
            }
        }
        
        // Advanced Metrics
        const advancedMetrics = localStorage.getItem('advancedPredictionMetrics');
        if (!advancedMetrics) {
            this.addIssue('LOW', 'No advanced metrics found');
            score -= 5;
        }
        
        // Pattern Database
        const patternDatabase = localStorage.getItem('mlPatternDatabase');
        if (!patternDatabase) {
            this.addIssue('LOW', 'No ML pattern database found');
            score -= 5;
        }
        
        return Math.max(0, score);
    }

    checkPerformance() {
        let score = 100;
        
        // Check if predictions are being generated
        const lastPredictionTime = localStorage.getItem('lastPredictionTime');
        if (lastPredictionTime) {
            const timeSinceLastPrediction = Date.now() - parseInt(lastPredictionTime);
            if (timeSinceLastPrediction > 600000) { // 10 minutes
                this.addIssue('MEDIUM', 'No predictions generated in last 10 minutes');
                score -= 15;
            }
        } else {
            this.addIssue('MEDIUM', 'No prediction timestamp found');
            score -= 10;
        }
        
        // Check memory usage (basic)
        if (performance && performance.memory) {
            const memUsage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
            if (memUsage > 0.9) {
                this.addIssue('HIGH', 'High memory usage detected');
                score -= 20;
            }
        }
        
        return Math.max(0, score);
    }

    checkAPIConnectivity() {
        let score = 100;
        
        // This is a basic check - real API check would require actual calls
        // Check if we have recent data
        const lastDataUpdate = localStorage.getItem('lastDataUpdate');
        if (lastDataUpdate) {
            const timeSinceUpdate = Date.now() - parseInt(lastDataUpdate);
            if (timeSinceUpdate > 900000) { // 15 minutes
                this.addIssue('HIGH', 'No API data update in last 15 minutes');
                score -= 25;
            }
        } else {
            this.addIssue('MEDIUM', 'No API update timestamp found');
            score -= 15;
        }
        
        return Math.max(0, score);
    }

    checkMLSystems() {
        let score = 100;
        
        // Check if ML pattern database exists and has data
        const patternDB = localStorage.getItem('mlPatternDatabase');
        if (patternDB) {
            try {
                const parsed = JSON.parse(patternDB);
                const successfulCount = parsed.successful?.length || 0;
                const failedCount = parsed.failed?.length || 0;
                const totalPatterns = successfulCount + failedCount;
                
                if (totalPatterns === 0) {
                    this.addIssue('LOW', 'ML system has no learned patterns yet');
                    score -= 10;
                } else if (totalPatterns < 10) {
                    this.addIssue('LOW', 'ML system has limited pattern data');
                    score -= 5;
                }
                
                // Check success rate
                if (totalPatterns > 0) {
                    const successRate = (successfulCount / totalPatterns) * 100;
                    if (successRate < 30) {
                        this.addIssue('MEDIUM', 'Low ML success rate detected');
                        score -= 15;
                    }
                }
            } catch (e) {
                this.addIssue('HIGH', 'Corrupted ML pattern database');
                score -= 25;
            }
        } else {
            this.addIssue('LOW', 'ML pattern database not initialized');
            score -= 5;
        }
        
        return Math.max(0, score);
    }

    calculateOverallHealth(scores) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return Math.round(average);
    }

    addIssue(severity, message) {
        this.issues.push({
            severity,
            message,
            timestamp: new Date().toISOString()
        });
    }

    logCriticalIssues() {
        const criticalIssues = this.issues.filter(issue => issue.severity === 'CRITICAL');
        const highIssues = this.issues.filter(issue => issue.severity === 'HIGH');
        
        criticalIssues.forEach(issue => {
            console.error(`🚨 CRITICAL: ${issue.message}`);
        });
        
        highIssues.forEach(issue => {
            console.warn(`⚠️ HIGH: ${issue.message}`);
        });
    }

    getHealthReport() {
        return {
            status: this.healthStatus.overall >= 80 ? 'HEALTHY' : 
                   this.healthStatus.overall >= 60 ? 'WARNING' : 'CRITICAL',
            score: this.healthStatus.overall,
            issues: this.issues.length,
            criticalIssues: this.issues.filter(i => i.severity === 'CRITICAL').length,
            lastCheck: new Date(this.healthStatus.timestamp).toLocaleString()
        };
    }

    // Auto-fix certain issues
    attemptAutoFix() {
        let fixedIssues = 0;
        
        // Try to reinitialize dashboard if missing
        if (typeof window.dashboard === 'undefined' && typeof TradingDashboard !== 'undefined') {
            try {
                window.dashboard = new TradingDashboard();
                fixedIssues++;
                console.log('✅ Auto-fixed: Dashboard reinitialized');
            } catch (e) {
                console.error('❌ Auto-fix failed for dashboard:', e);
            }
        }
        
        // Initialize empty prediction history if missing
        if (!localStorage.getItem('predictionHistory')) {
            localStorage.setItem('predictionHistory', '{}');
            fixedIssues++;
            console.log('✅ Auto-fixed: Initialized empty prediction history');
        }
        
        return fixedIssues;
    }
}

// Global health checker instance
window.systemHealthChecker = new SystemHealthChecker();

// Auto-start health monitoring when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.systemHealthChecker.startHealthMonitoring();
        console.log('🩺 System Health Monitoring initialized');
        
        // Try auto-fix on startup
        const fixedCount = window.systemHealthChecker.attemptAutoFix();
        if (fixedCount > 0) {
            console.log(`🔧 Auto-fixed ${fixedCount} issues on startup`);
        }
    }, 3000);
});

// Export for external use
window.SystemHealthChecker = SystemHealthChecker;
