// 🧠 MACHINE LEARNING ACCURACY ENHANCER
class MLAccuracyEnhancer {
    constructor() {
        this.patternDatabase = this.loadPatternDatabase();
        this.successfulPatterns = new Map();
        this.failedPatterns = new Map();
        this.accuracyThreshold = 70; // Minimum tačnost za pattern
    }

    // 1. PATTERN LEARNING SYSTEM
    analyzeMarketPattern(currentData) {
        const pattern = this.extractPattern(currentData);
        const patternKey = this.generatePatternKey(pattern);
        
        // Provjeri da li imamo historical data za ovaj pattern
        const historicalSuccess = this.getPatternSuccessRate(patternKey);
        
        console.log(`🔍 Pattern analiza: ${patternKey} | Success rate: ${historicalSuccess}%`);
        
        return {
            patternKey,
            confidence: historicalSuccess,
            shouldUsePattern: historicalSuccess > this.accuracyThreshold
        };
    }

    extractPattern(data) {
        const { indicators, price } = data;
        
        // Create fingerprint od market conditions
        return {
            rsi_zone: this.getRSIZone(indicators.rsi),
            macd_trend: indicators.macd.macd > indicators.macd.signal ? 'bull' : 'bear',
            bb_position: this.getBBPosition(price, indicators.bb),
            volume_level: indicators.volume.ratio > 1.5 ? 'high' : 'normal',
            ema_alignment: indicators.ema20 > indicators.ema50 ? 'bull' : 'bear',
            volatility: this.calculateVolatility(data)
        };
    }

    getRSIZone(rsi) {
        if (rsi < 30) return 'oversold';
        if (rsi > 70) return 'overbought';
        if (rsi < 45) return 'bearish';
        if (rsi > 55) return 'bullish';
        return 'neutral';
    }

    getBBPosition(price, bb) {
        if (price <= bb.lower) return 'bottom';
        if (price >= bb.upper) return 'top';
        const middle = (bb.upper + bb.lower) / 2;
        return price > middle ? 'upper_half' : 'lower_half';
    }

    calculateVolatility(data) {
        // Jednostavan volatility indicator
        const { indicators } = data;
        const bbWidth = (indicators.bb.upper - indicators.bb.lower) / indicators.bb.lower;
        
        if (bbWidth > 0.05) return 'high';
        if (bbWidth > 0.02) return 'medium';
        return 'low';
    }

    // 2. ADAPTIVE CONFIDENCE SYSTEM
    calculateAdaptiveConfidence(baseConfidence, pattern, timeframe) {
        let adjustedConfidence = baseConfidence;
        
        // Pattern success rate adjustment
        const patternSuccess = this.getPatternSuccessRate(pattern.patternKey);
        if (patternSuccess > 0) {
            const patternMultiplier = Math.min(1.5, patternSuccess / 70);
            adjustedConfidence *= patternMultiplier;
            console.log(`🎯 Pattern boost: ${patternSuccess}% → confidence × ${patternMultiplier.toFixed(2)}`);
        }
        
        // Timeframe reliability adjustment
        const timeframeReliability = this.getTimeframeReliability(timeframe);
        adjustedConfidence *= timeframeReliability;
        
        // Market conditions adjustment
        const marketConditionMultiplier = this.getMarketConditionMultiplier(pattern);
        adjustedConfidence *= marketConditionMultiplier;
        
        return Math.min(95, Math.max(45, adjustedConfidence));
    }

    getTimeframeReliability(timeframe) {
        // Kraći timeframe-ovi = manje pouzdani
        const reliability = {
            '1m': 0.8,   '3m': 0.85,  '15m': 0.9,
            '1h': 1.0,   '4h': 1.1,   '6h': 1.15,
            '12h': 1.2,  '1d': 1.25,  '1w': 1.3, '1M': 1.35
        };
        return reliability[timeframe] || 1.0;
    }

    getMarketConditionMultiplier(pattern) {
        // Povećaj confidence za najbolje market uslove
        let multiplier = 1.0;
        
        // Strong trending markets = bolji signali
        if (pattern.ema_alignment === 'bull' && pattern.rsi_zone === 'bullish') {
            multiplier += 0.15;
        }
        
        // High volume = potvrda signala
        if (pattern.volume_level === 'high') {
            multiplier += 0.1;
        }
        
        // Extreme RSI zones = mean reversion opportunites
        if (pattern.rsi_zone === 'oversold' || pattern.rsi_zone === 'overbought') {
            multiplier += 0.1;
        }
        
        return Math.min(1.4, multiplier);
    }

    // 3. LEARNING FROM MISTAKES
    recordPredictionResult(patternKey, predicted, actual, timeframe) {
        const wasCorrect = this.isPredictionCorrect(predicted, actual);
        
        if (wasCorrect) {
            this.recordSuccessfulPattern(patternKey, timeframe);
        } else {
            this.recordFailedPattern(patternKey, timeframe, predicted, actual);
        }
        
        this.savePatternDatabase();
        console.log(`📚 Pattern learned: ${patternKey} = ${wasCorrect ? '✅' : '❌'}`);
    }

    isPredictionCorrect(predicted, actual) {
        // Allow some tolerance for "correct" predictions
        const tolerance = 0.5; // 0.5% tolerance
        
        if (predicted.direction === 'rast' && actual > tolerance) return true;
        if (predicted.direction === 'pad' && actual < -tolerance) return true;
        if (predicted.direction === 'konsolidacija' && Math.abs(actual) <= tolerance) return true;
        
        return false;
    }

    // 4. DYNAMIC INDICATOR WEIGHTS
    calculateDynamicWeights(pattern, historicalData) {
        const weights = {
            rsi: 0.25,
            macd: 0.25,
            bb: 0.2,
            volume: 0.15,
            ema: 0.15
        };
        
        // Adjust weights based na što je historijski radilo najbolje
        if (pattern.volatility === 'high') {
            weights.bb += 0.1;     // Bollinger bands bolji u volatile markets
            weights.rsi -= 0.05;   // RSI manje pouzdan u volatility
        }
        
        if (pattern.volume_level === 'high') {
            weights.volume += 0.1; // Volume confirmation važniji
            weights.macd -= 0.05;  // MACD može lagovati
        }
        
        return weights;
    }

    // Utility functions
    generatePatternKey(pattern) {
        return `${pattern.rsi_zone}_${pattern.macd_trend}_${pattern.bb_position}_${pattern.volume_level}_${pattern.ema_alignment}_${pattern.volatility}`;
    }

    getPatternSuccessRate(patternKey) {
        const successful = this.successfulPatterns.get(patternKey) || 0;
        const failed = this.failedPatterns.get(patternKey) || 0;
        const total = successful + failed;
        
        return total > 0 ? (successful / total) * 100 : 50; // Default 50% if no data
    }

    recordSuccessfulPattern(patternKey, timeframe) {
        const current = this.successfulPatterns.get(patternKey) || 0;
        this.successfulPatterns.set(patternKey, current + 1);
    }

    recordFailedPattern(patternKey, timeframe, predicted, actual) {
        const current = this.failedPatterns.get(patternKey) || 0;
        this.failedPatterns.set(patternKey, current + 1);
        
        // Log why it failed for future reference
        console.log(`❌ Pattern failure: ${patternKey} | Predicted: ${predicted.direction}, Actual: ${actual.toFixed(2)}%`);
    }

    loadPatternDatabase() {
        const saved = localStorage.getItem('mlPatternDatabase');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.successfulPatterns = new Map(data.successful || []);
                this.failedPatterns = new Map(data.failed || []);
                console.log(`🧠 Učitao ${this.successfulPatterns.size} uspješnih pattern-a`);
            } catch (error) {
                console.error('Greška pri učitavanju ML database:', error);
            }
        }
        return {};
    }

    savePatternDatabase() {
        const data = {
            successful: Array.from(this.successfulPatterns.entries()),
            failed: Array.from(this.failedPatterns.entries()),
            lastUpdated: Date.now()
        };
        localStorage.setItem('mlPatternDatabase', JSON.stringify(data));
    }

    // 5. MARKET REGIME DETECTION
    detectMarketRegime(historicalData) {
        // Detect bull/bear/sideways market regime
        // This influences prediction strategy
        
        const regimes = {
            BULL_MARKET: { threshold: 0.15, strategy: 'trend_following' },
            BEAR_MARKET: { threshold: -0.15, strategy: 'mean_reversion' },
            SIDEWAYS: { threshold: 0.05, strategy: 'range_trading' }
        };
        
        // Implementation would analyze recent price action
        return 'SIDEWAYS'; // Placeholder
    }

    // 6. ENSEMBLE PREDICTION
    generateEnsemblePrediction(predictions, pattern) {
        // Combine multiple prediction methods
        const methods = ['technical', 'pattern', 'sentiment', 'momentum'];
        const weights = this.calculateDynamicWeights(pattern);
        
        // Weight average predictions based na historical performance
        return this.weightedAverage(predictions, weights);
    }

    weightedAverage(predictions, weights) {
        // Implementation za ensemble averaging
        return predictions[0]; // Placeholder
    }
}

// Export for main script
window.MLAccuracyEnhancer = MLAccuracyEnhancer;
