// 🔍 REAL-TIME DEBUG & VERIFICATION PANEL
class DebugPanel {
    constructor() {
        this.isVisible = false;
        this.metrics = {};
        this.logs = [];
        this.createDebugPanel();
        this.startSystemChecks();
        
        // Shortcut za toggle debug panel
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.togglePanel();
            }
        });
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #00ff88;
            border-radius: 15px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            overflow-y: auto;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
            display: none;
            backdrop-filter: blur(10px);
        `;

        panel.innerHTML = `
            <div style="background: #00ff88; color: #000; padding: 10px; text-align: center; font-weight: bold;">
                🔍 SYSTEM DEBUG PANEL (Ctrl+D)
            </div>
            <div id="debug-content" style="padding: 15px;">
                <div id="system-status"></div>
                <div id="ml-status"></div>
                <div id="accuracy-metrics"></div>
                <div id="prediction-history"></div>
                <div id="console-logs"></div>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;
    }

    togglePanel() {
        this.isVisible = !this.isVisible;
        this.panel.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.updateAllSections();
            console.log('🔍 Debug Panel OPENED - Press Ctrl+D to close');
        } else {
            console.log('🔍 Debug Panel CLOSED');
        }
    }

    startSystemChecks() {
        // Initial check
        this.performSystemChecks();
        
        // Periodic checks every 10 seconds
        setInterval(() => {
            this.performSystemChecks();
            if (this.isVisible) {
                this.updateAllSections();
            }
        }, 10000);
    }

    performSystemChecks() {
        const timestamp = new Date().toLocaleTimeString();
        
        // Check if main systems are loaded
        const checks = {
            TradingDashboard: typeof TradingDashboard !== 'undefined',
            MLAccuracyEnhancer: typeof MLAccuracyEnhancer !== 'undefined',
            DashboardInstance: typeof window.dashboard !== 'undefined',
            ChartJS: typeof Chart !== 'undefined',
            LocalStorage: this.checkLocalStorage(),
            PredictionHistory: this.checkPredictionHistory(),
            AdvancedMetrics: this.checkAdvancedMetrics(),
            PatternDatabase: this.checkPatternDatabase()
        };

        this.metrics = {
            timestamp,
            systemChecks: checks,
            successRate: Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100,
            ...this.getPerformanceMetrics()
        };

        // Log any failures
        Object.entries(checks).forEach(([system, status]) => {
            if (!status) {
                this.log(`❌ ${system} FAILED`, 'error');
            }
        });
    }

    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    checkPredictionHistory() {
        const history = localStorage.getItem('predictionHistory');
        return history && JSON.parse(history);
    }

    checkAdvancedMetrics() {
        const metrics = localStorage.getItem('advancedPredictionMetrics');
        return metrics && JSON.parse(metrics);
    }

    checkPatternDatabase() {
        const patterns = localStorage.getItem('mlPatternDatabase');
        return patterns && JSON.parse(patterns);
    }

    getPerformanceMetrics() {
        const history = this.checkPredictionHistory();
        const advanced = this.checkAdvancedMetrics();
        const patterns = this.checkPatternDatabase();

        return {
            historyCount: history ? Object.keys(history).length : 0,
            totalPredictions: advanced ? advanced.length : 0,
            patternCount: patterns ? (patterns.successful?.length || 0) + (patterns.failed?.length || 0) : 0,
            lastUpdate: advanced && advanced.length > 0 ? new Date(advanced[advanced.length - 1].timestamp).toLocaleTimeString() : 'Never'
        };
    }

    updateAllSections() {
        this.updateSystemStatus();
        this.updateMLStatus();
        this.updateAccuracyMetrics();
        this.updatePredictionHistory();
        this.updateConsoleLogs();
    }

    updateSystemStatus() {
        const statusDiv = document.getElementById('system-status');
        const { systemChecks, successRate, timestamp } = this.metrics;
        
        const statusItems = Object.entries(systemChecks).map(([system, status]) => 
            `<div style="color: ${status ? '#00ff88' : '#ff6b6b'}">
                ${status ? '✅' : '❌'} ${system}
            </div>`
        ).join('');

        statusDiv.innerHTML = `
            <h3 style="color: #00ff88; margin-bottom: 10px;">🔧 SYSTEM STATUS</h3>
            <div style="background: rgba(0,255,136,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <div style="color: #ffd700; margin-bottom: 5px;">
                    Overall Health: ${successRate.toFixed(1)}% | Last Check: ${timestamp}
                </div>
                ${statusItems}
            </div>
        `;
    }

    updateMLStatus() {
        const mlDiv = document.getElementById('ml-status');
        const patterns = this.checkPatternDatabase();
        
        let mlContent = `
            <h3 style="color: #00ff88; margin-bottom: 10px;">🧠 MACHINE LEARNING STATUS</h3>
            <div style="background: rgba(0,255,136,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
        `;

        if (patterns) {
            const successful = patterns.successful?.length || 0;
            const failed = patterns.failed?.length || 0;
            const total = successful + failed;
            const successRate = total > 0 ? (successful / total * 100).toFixed(1) : '0';

            mlContent += `
                <div style="color: #ffd700;">📊 Pattern Database Active</div>
                <div>✅ Successful Patterns: ${successful}</div>
                <div>❌ Failed Patterns: ${failed}</div>
                <div>🎯 ML Success Rate: ${successRate}%</div>
                <div>📅 Last Updated: ${patterns.lastUpdated ? new Date(patterns.lastUpdated).toLocaleString() : 'Never'}</div>
            `;
        } else {
            mlContent += `<div style="color: #ff6b6b;">❌ Pattern Database Not Found</div>`;
        }

        mlContent += `</div>`;
        mlDiv.innerHTML = mlContent;
    }

    updateAccuracyMetrics() {
        const metricsDiv = document.getElementById('accuracy-metrics');
        const advanced = this.checkAdvancedMetrics();
        
        let content = `
            <h3 style="color: #00ff88; margin-bottom: 10px;">📈 ACCURACY METRICS</h3>
            <div style="background: rgba(0,255,136,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
        `;

        if (advanced && advanced.length > 0) {
            const latest = advanced[advanced.length - 1];
            const recent5 = advanced.slice(-5);
            const avgConfidence = recent5.reduce((sum, m) => sum + m.avgConfidence, 0) / recent5.length;

            content += `
                <div style="color: #ffd700;">📊 Total Predictions: ${advanced.length}</div>
                <div>🎯 Latest Avg Confidence: ${latest.avgConfidence.toFixed(1)}%</div>
                <div>📊 Recent 5 Avg: ${avgConfidence.toFixed(1)}%</div>
                <div>🔍 Latest MTF Trend: ${latest.mtfTrend} (${latest.mtfStrength}%)</div>
                <div>📊 Market Regime: ${latest.marketRegime} (${latest.marketConfidence}%)</div>
                <div>⏰ Last Prediction: ${new Date(latest.timestamp).toLocaleString()}</div>
            `;
        } else {
            content += `<div style="color: #ff6b6b;">❌ No Advanced Metrics Found</div>`;
        }

        content += `</div>`;
        metricsDiv.innerHTML = content;
    }

    updatePredictionHistory() {
        const historyDiv = document.getElementById('prediction-history');
        const history = this.checkPredictionHistory();
        
        let content = `
            <h3 style="color: #00ff88; margin-bottom: 10px;">📚 PREDICTION HISTORY</h3>
            <div style="background: rgba(0,255,136,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
        `;

        if (history) {
            const timeframes = Object.keys(history);
            content += `<div style="color: #ffd700;">Active Timeframes: ${timeframes.length}</div>`;
            
            timeframes.forEach(tf => {
                const predictions = history[tf];
                const verified = predictions.filter(p => p.verified);
                const correct = verified.filter(p => p.correct);
                const accuracy = verified.length > 0 ? (correct.length / verified.length * 100).toFixed(1) : 'N/A';
                
                content += `
                    <div style="margin: 5px 0;">
                        📊 ${tf}: ${predictions.length} predictions, ${accuracy}% accuracy
                    </div>
                `;
            });
        } else {
            content += `<div style="color: #ff6b6b;">❌ No Prediction History Found</div>`;
        }

        content += `</div>`;
        historyDiv.innerHTML = content;
    }

    updateConsoleLogs() {
        const logsDiv = document.getElementById('console-logs');
        
        let content = `
            <h3 style="color: #00ff88; margin-bottom: 10px;">📝 RECENT LOGS</h3>
            <div style="background: rgba(0,255,136,0.1); padding: 10px; border-radius: 8px; height: 150px; overflow-y: auto; font-size: 10px;">
        `;

        // Show recent logs
        const recentLogs = this.logs.slice(-10);
        if (recentLogs.length > 0) {
            content += recentLogs.map(log => 
                `<div style="color: ${this.getLogColor(log.type)}; margin: 2px 0;">
                    [${log.timestamp}] ${log.message}
                </div>`
            ).join('');
        } else {
            content += `<div style="color: #888;">No recent logs</div>`;
        }

        content += `</div>`;
        logsDiv.innerHTML = content;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({ message, type, timestamp });
        
        // Keep only last 50 logs
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(-50);
        }

        // Also log to console
        console.log(`[DEBUG] ${message}`);
    }

    getLogColor(type) {
        const colors = {
            info: '#fff',
            success: '#00ff88',
            warning: '#ffd700',
            error: '#ff6b6b'
        };
        return colors[type] || '#fff';
    }

    // Public methods for external logging
    static logSuccess(message) {
        if (window.debugPanel) {
            window.debugPanel.log(`✅ ${message}`, 'success');
        }
    }

    static logError(message) {
        if (window.debugPanel) {
            window.debugPanel.log(`❌ ${message}`, 'error');
        }
    }

    static logWarning(message) {
        if (window.debugPanel) {
            window.debugPanel.log(`⚠️ ${message}`, 'warning');
        }
    }

    static logInfo(message) {
        if (window.debugPanel) {
            window.debugPanel.log(`ℹ️ ${message}`, 'info');
        }
    }
}

// Initialize debug panel when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other systems to load
    setTimeout(() => {
        window.debugPanel = new DebugPanel();
        console.log('🔍 Debug Panel initialized! Press Ctrl+D to open/close');
        
        // Show initial notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff88;
            color: #000;
            padding: 10px 15px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10001;
            animation: fadeInOut 3s ease-in-out;
        `;
        notification.textContent = '🔍 Debug Panel Ready! Press Ctrl+D';
        
        // Add fadeInOut animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(100%); }
                20% { opacity: 1; transform: translateX(0); }
                80% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }, 2000);
});

// Export for external use
window.DebugPanel = DebugPanel;
