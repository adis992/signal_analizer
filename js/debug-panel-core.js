// 🔬 DEBUG PANEL JAVASCRIPT
class DebugPanel {
    constructor() {
        this.logs = [];
        this.errors = [];
        this.maxLogs = 1000;
        this.maxErrors = 100;
        this.mainDashboard = null;
        this.mlEnhancer = null;
        this.connectionAttempts = 0;
        this.isConnected = false;
        
        this.initializePanel();
        this.connectToMainDashboard();
    }

    initializePanel() {
        this.log('🚀 Debug Panel initialized', 'info');
        this.updateConnectionStatus('warning', 'Initializing...');
        
        // Setup periodic updates
        setInterval(() => this.updateLiveMetrics(), 5000);
        setInterval(() => this.checkMainDashboardConnection(), 10000);
        
        this.log('⏰ Periodic updates configured', 'success');
    }

    connectToMainDashboard() {
        this.connectionAttempts++;
        this.log(`🔗 Attempting connection to main dashboard (attempt ${this.connectionAttempts})`, 'info');
        
        try {
            // Try to access main window if opened from main dashboard
            if (window.opener && window.opener.dashboard) {
                this.mainDashboard = window.opener.dashboard;
                this.mlEnhancer = window.opener.MLAccuracyEnhancer ? new window.opener.MLAccuracyEnhancer() : null;
                this.isConnected = true;
                this.updateConnectionStatus('ok', 'Connected to main dashboard');
                this.log('✅ Successfully connected to main dashboard', 'success');
                return true;
            }
            
            // Try localStorage bridge
            const bridgeData = localStorage.getItem('debugBridge');
            if (bridgeData) {
                const bridge = JSON.parse(bridgeData);
                this.log(`📡 Found bridge data: ${Object.keys(bridge).length} keys`, 'info');
                this.isConnected = true;
                this.updateConnectionStatus('ok', 'Connected via localStorage bridge');
                return true;
            }
            
            // STANDALONE MODE - direct access without main dashboard
            this.log('🔧 No main dashboard connection, switching to standalone mode', 'warning');
            this.isConnected = true;
            this.updateConnectionStatus('warning', 'Standalone mode - Limited functionality');
            
            // Try to load ML enhancer directly
            if (typeof MLAccuracyEnhancer !== 'undefined') {
                this.mlEnhancer = new MLAccuracyEnhancer();
                this.log('✅ ML Enhancer loaded in standalone mode', 'success');
            } else {
                this.log('⚠️ ML Enhancer not available in standalone mode', 'warning');
            }
            
            return true;
            
        } catch (error) {
            this.log(`❌ Connection error: ${error.message}`, 'error');
            this.addError('Connection Error', error.message);
            
            // Fallback to simulated data
            if (this.connectionAttempts >= 3) {
                this.log('⚠️ Using simulated data mode', 'warning');
                this.updateConnectionStatus('warning', 'Simulated mode');
                this.useSimulatedData();
                return false;
            }
            
            // Retry after delay
            setTimeout(() => this.connectToMainDashboard(), 3000);
        }
        
        return false;
    }

    useSimulatedData() {
        this.log('🎭 Generating simulated data for demonstration', 'warning');
        
        // Create simulated ML enhancer
        this.mlEnhancer = {
            successfulPatterns: new Map([
                ['bullish_bull_upper_half_high_bull_medium', 15],
                ['neutral_bear_lower_half_normal_bear_low', 8],
                ['oversold_bull_bottom_high_bull_high', 22]
            ]),
            failedPatterns: new Map([
                ['bullish_bull_upper_half_high_bull_medium', 3],
                ['neutral_bear_lower_half_normal_bear_low', 12],
                ['overbought_bear_top_normal_bear_medium', 7]
            ])
        };
        
        // Generate simulated prediction history
        const simulatedHistory = {};
        const timeframes = ['1m', '3m', '15m', '1h', '4h', '1d'];
        timeframes.forEach(tf => {
            simulatedHistory[tf] = this.generateSimulatedPredictions(10);
        });
        
        localStorage.setItem('predictionHistory', JSON.stringify(simulatedHistory));
        localStorage.setItem('advancedPredictionMetrics', JSON.stringify(this.generateSimulatedMetrics()));
        
        this.log('✅ Simulated data generated successfully', 'success');
    }

    generateSimulatedPredictions(count) {
        const predictions = [];
        for (let i = 0; i < count; i++) {
            predictions.push({
                timestamp: Date.now() - (i * 300000), // 5 min intervals
                direction: Math.random() > 0.6 ? 'rast' : Math.random() > 0.3 ? 'konsolidacija' : 'pad',
                confidence: 50 + Math.random() * 40,
                verified: Math.random() > 0.3,
                correct: Math.random() > 0.4
            });
        }
        return predictions;
    }

    generateSimulatedMetrics() {
        const metrics = [];
        for (let i = 0; i < 20; i++) {
            metrics.push({
                timestamp: Date.now() - (i * 900000), // 15 min intervals
                totalPredictions: 10,
                rastCount: Math.floor(Math.random() * 6) + 2,
                padCount: Math.floor(Math.random() * 3),
                avgConfidence: 60 + Math.random() * 30,
                mtfTrend: Math.random() > 0.5 ? 'bullish' : 'bearish',
                mtfStrength: 50 + Math.random() * 40,
                marketRegime: ['BULL_TREND', 'BEAR_TREND', 'SIDEWAYS'][Math.floor(Math.random() * 3)],
                marketConfidence: 60 + Math.random() * 30
            });
        }
        return metrics;
    }

    checkMainDashboardConnection() {
        if (!this.isConnected) {
            this.connectToMainDashboard();
        }
    }

    updateConnectionStatus(status, message) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            indicator.className = `status-indicator status-${status}`;
            statusElement.innerHTML = `<span class="status-indicator status-${status}"></span>${message}`;
        }
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            type
        };
        
        this.logs.unshift(logEntry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        
        this.updateDebugLog();
        console.log(`[DEBUG] ${timestamp} ${message}`);
    }

    addError(title, message) {
        const errorEntry = {
            timestamp: new Date().toLocaleTimeString(),
            title,
            message
        };
        
        this.errors.unshift(errorEntry);
        
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }
        
        this.updateErrorLog();
    }

    updateDebugLog() {
        const logElement = document.getElementById('debugLog');
        if (!logElement) return;
        
        logElement.innerHTML = this.logs.slice(0, 50).map(log => 
            `<div class="log-entry log-${log.type}">[${log.timestamp}] ${log.message}</div>`
        ).join('');
        
        logElement.scrollTop = 0;
    }

    updateErrorLog() {
        const errorElement = document.getElementById('errorLog');
        if (!errorElement) return;
        
        if (this.errors.length === 0) {
            errorElement.innerHTML = '<div class="log-entry log-info">No errors detected</div>';
        } else {
            errorElement.innerHTML = this.errors.map(error => 
                `<div class="log-entry log-error">[${error.timestamp}] ${error.title}: ${error.message}</div>`
            ).join('');
        }
    }

    updateLiveMetrics() {
        try {
            // System Health
            const health = this.calculateSystemHealth();
            this.updateElement('systemHealth', health.status);
            this.updateElement('healthDetails', this.generateHealthDetails(health));
            
            // Live Metrics
            this.updateElement('activePredictions', this.getActivePredictionsCount());
            this.updateElement('currentAccuracy', this.getCurrentAccuracy() + '%');
            this.updateElement('lastUpdate', new Date().toLocaleTimeString());
            
            // ML Patterns
            this.updateMLPatterns();
            
            this.log('📊 Live metrics updated', 'info');
            
        } catch (error) {
            this.log(`❌ Error updating metrics: ${error.message}`, 'error');
            this.addError('Metrics Update Error', error.message);
        }
    }

    calculateSystemHealth() {
        let score = 100;
        const issues = [];
        
        // Check LocalStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            score -= 30;
            issues.push('LocalStorage not available');
        }
        
        // Check ML Database
        const mlData = localStorage.getItem('mlPatternDatabase');
        if (!mlData) {
            score -= 20;
            issues.push('ML Pattern database not found');
        }
        
        // Check Prediction History
        const predHistory = localStorage.getItem('predictionHistory');
        if (!predHistory) {
            score -= 15;
            issues.push('Prediction history not found');
        }
        
        // Check Connection
        if (!this.isConnected) {
            score -= 25;
            issues.push('Not connected to main dashboard');
        }
        
        let status = 'Excellent';
        if (score < 90) status = 'Good';
        if (score < 70) status = 'Warning';
        if (score < 50) status = 'Critical';
        
        return { score, status, issues };
    }

    generateHealthDetails(health) {
        let html = `<div class="metric-card">
            <div class="metric-value" style="color: ${health.score > 70 ? '#4ecdc4' : health.score > 50 ? '#ffd700' : '#ff6b6b'}">${health.score}/100</div>
            <div class="metric-label">Health Score</div>
        </div>`;
        
        if (health.issues.length > 0) {
            html += '<div style="margin-top: 15px;"><strong>Issues:</strong><ul>';
            health.issues.forEach(issue => {
                html += `<li style="color: #ff6b6b; margin: 5px 0;">${issue}</li>`;
            });
            html += '</ul></div>';
        }
        
        return html;
    }

    getActivePredictionsCount() {
        try {
            const predHistory = JSON.parse(localStorage.getItem('predictionHistory') || '{}');
            return Object.keys(predHistory).length;
        } catch (e) {
            return 0;
        }
    }

    getCurrentAccuracy() {
        try {
            const metrics = JSON.parse(localStorage.getItem('advancedPredictionMetrics') || '[]');
            if (metrics.length === 0) return 0;
            
            const recent = metrics.slice(0, 5);
            const avgAccuracy = recent.reduce((sum, m) => sum + (m.avgConfidence || 0), 0) / recent.length;
            return Math.round(avgAccuracy);
        } catch (e) {
            return 0;
        }
    }

    updateMLPatterns() {
        if (!this.mlEnhancer) return;
        
        try {
            const successCount = this.mlEnhancer.successfulPatterns.size;
            const failCount = this.mlEnhancer.failedPatterns.size;
            const totalPatterns = successCount + failCount;
            const successRate = totalPatterns > 0 ? ((successCount / totalPatterns) * 100).toFixed(1) : 0;
            
            this.updateElement('learnedPatterns', totalPatterns);
            this.updateElement('patternAccuracy', successRate + '%');
            
            // Update patterns table
            this.updatePatternsTable();
            
        } catch (error) {
            this.log(`❌ Error updating ML patterns: ${error.message}`, 'error');
        }
    }

    updatePatternsTable() {
        const tableBody = document.getElementById('patternsTableBody');
        if (!tableBody || !this.mlEnhancer) return;
        
        const patterns = [];
        
        // Combine successful and failed patterns
        this.mlEnhancer.successfulPatterns.forEach((successCount, key) => {
            const failCount = this.mlEnhancer.failedPatterns.get(key) || 0;
            const total = successCount + failCount;
            const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : 0;
            
            patterns.push({
                key,
                successCount,
                failCount,
                successRate,
                lastUsed: 'Recent'
            });
        });
        
        // Add failed-only patterns
        this.mlEnhancer.failedPatterns.forEach((failCount, key) => {
            if (!this.mlEnhancer.successfulPatterns.has(key)) {
                patterns.push({
                    key,
                    successCount: 0,
                    failCount,
                    successRate: '0.0',
                    lastUsed: 'Recent'
                });
            }
        });
        
        if (patterns.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No patterns learned yet</td></tr>';
            return;
        }
        
        tableBody.innerHTML = patterns.slice(0, 10).map(pattern => `
            <tr>
                <td style="font-size: 0.8rem;">${pattern.key}</td>
                <td style="color: #4ecdc4;">${pattern.successCount}</td>
                <td style="color: #ff6b6b;">${pattern.failCount}</td>
                <td style="color: ${parseFloat(pattern.successRate) > 60 ? '#4ecdc4' : '#ffd700'};">${pattern.successRate}%</td>
                <td>${pattern.lastUsed}</td>
            </tr>
        `).join('');
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = content;
        }
    }

    // Database operations
    refreshDatabase() {
        this.log('🔄 Refreshing database info', 'info');
        
        const dbInfo = document.getElementById('databaseInfo');
        if (!dbInfo) return;
        
        let html = '<div class="metric-card">';
        
        try {
            // Check all localStorage keys
            const keys = Object.keys(localStorage);
            const totalSize = new Blob(Object.values(localStorage)).size;
            
            html += `
                <div class="metric-value">${keys.length}</div>
                <div class="metric-label">Total LocalStorage Keys</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(totalSize / 1024).toFixed(1)} KB</div>
                <div class="metric-label">Total Storage Size</div>
            </div>`;
            
            // Individual key details
            html += '<table class="pattern-table"><thead><tr><th>Key</th><th>Size (bytes)</th><th>Type</th></tr></thead><tbody>';
            
            keys.forEach(key => {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                let type = 'String';
                
                try {
                    JSON.parse(value);
                    type = 'JSON';
                } catch (e) {
                    // Keep as String
                }
                
                html += `<tr><td>${key}</td><td>${size}</td><td>${type}</td></tr>`;
            });
            
            html += '</tbody></table>';
            
        } catch (error) {
            html += `<div style="color: #ff6b6b;">Error: ${error.message}</div>`;
        }
        
        dbInfo.innerHTML = html;
        this.log('✅ Database info refreshed', 'success');
    }
}

// Tab functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate button
    event.target.classList.add('active');
    
    // Trigger refresh for specific tabs
    if (tabName === 'ml-patterns') {
        setTimeout(() => window.debugPanel?.updateMLPatterns(), 100);
    } else if (tabName === 'database') {
        setTimeout(() => window.debugPanel?.refreshDatabase(), 100);
    }
}

// Action functions
function checkSystemHealth() {
    window.debugPanel?.updateLiveMetrics();
    window.debugPanel?.log('🏥 Manual health check triggered', 'info');
}

function clearDebugLog() {
    if (window.debugPanel) {
        window.debugPanel.logs = [];
        window.debugPanel.updateDebugLog();
        window.debugPanel.log('🗑️ Debug log cleared', 'info');
    }
}

function refreshDebugLog() {
    window.debugPanel?.updateDebugLog();
    window.debugPanel?.log('🔄 Debug log refreshed', 'info');
}

function refreshMLPatterns() {
    window.debugPanel?.updateMLPatterns();
    window.debugPanel?.log('🧠 ML patterns refreshed', 'info');
}

function clearMLDatabase() {
    if (confirm('Are you sure you want to clear the ML pattern database?')) {
        localStorage.removeItem('mlPatternDatabase');
        window.debugPanel?.log('🗑️ ML database cleared', 'warning');
        setTimeout(() => refreshMLPatterns(), 100);
    }
}

function refreshAccuracy() {
    window.debugPanel?.log('🎯 Accuracy metrics refreshed', 'info');
}

function clearErrorLog() {
    if (window.debugPanel) {
        window.debugPanel.errors = [];
        window.debugPanel.updateErrorLog();
        window.debugPanel.log('🗑️ Error log cleared', 'info');
    }
}

function refreshDatabase() {
    window.debugPanel?.refreshDatabase();
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL localStorage data? This cannot be undone!')) {
        localStorage.clear();
        window.debugPanel?.log('🗑️ All localStorage data cleared', 'warning');
        setTimeout(() => location.reload(), 1000);
    }
}

function exportData() {
    try {
        const data = {};
        Object.keys(localStorage).forEach(key => {
            data[key] = localStorage.getItem(key);
        });
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `signal-analyzer-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        window.debugPanel?.log('📤 Data exported successfully', 'success');
    } catch (error) {
        window.debugPanel?.log(`❌ Export failed: ${error.message}`, 'error');
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                
                window.debugPanel?.log('📥 Data imported successfully', 'success');
                setTimeout(() => location.reload(), 1000);
            } catch (error) {
                window.debugPanel?.log(`❌ Import failed: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Initialize debug panel
function initializeDebugPanel() {
    window.debugPanel = new DebugPanel();
}

// Auto-refresh functions
function updateLiveMetrics() {
    window.debugPanel?.updateLiveMetrics();
}
