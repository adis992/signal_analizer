class TradingDashboard {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.cryptoData = {};
        this.selectedCrypto = 'BTCUSDT';
        this.selectedTimeframe = '1m';  // Promenio na 1m
        this.chart            // Učitaj multi-timeframe analizu
            await this.updateTimeframeAnalysis(symbol);
            
            // Učitaj grafikon
            await this.loadChart(symbol, timeframe);
            
        } catch (error) {ull;
        this.updateInterval = null;
        
        // Crypto ikone
        this.cryptoIcons = {
            'BTC': '₿',
            'ETH': 'Ξ', 
            'BNB': '🔸',
            'SOL': '◉',
            'XRP': '◈',
            'ADA': '◊',
            'DOT': '●',
            'LINK': '🔗',
            'LTC': 'Ł',
            'BCH': '₿',
            'XLM': '★',
            'UNI': '🦄',
            'VET': '⚡',
            'TRX': '🔺',
            'FIL': '📁',
            'AAVE': '👻',
            'MATIC': '🔷',
            'ATOM': '⚛️',
            'NEAR': '🌙',
            'AVAX': '🔺',
            'FTM': '👻',
            'ALGO': '◯',
            'ICP': '∞',
            'SAND': '🏖️',
            'MANA': '🌍',
            'AXS': '⚔️',
            'THETA': 'θ',
            'MKR': '🔨',
            'COMP': '🏛️',
            'SUSHI': '🍣',
            'YFI': '🔮',
            'CRV': '💎',
            'SNX': '⚡',
            '1INCH': '🗂️',
            'ENJ': '🎮'
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicijalizujem Trading Dashboard...');
        
        // Ažuriraj vreme
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Učitaj početne podatke
        await this.loadInitialData();
        
        // Postavi event listenere
        this.setupEventListeners();
        
        // Počni kontinuirane ažuriranja
        this.startUpdates();
        
        console.log('✅ Dashboard uspešno inicijalizovan!');
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('sr-RS', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const updateElement = document.getElementById('last-update-time');
        if (updateElement) {
            updateElement.textContent = timeString;
        }
    }

    async loadInitialData() {
        try {
            console.log('📊 Učitavam početne podatke...');
            
            // Učitaj listu kriptovaluta
            const response = await fetch(`${this.apiUrl}/crypto-list`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const cryptos = await response.json();
            console.log('💰 Učitano', cryptos.length, 'kriptovaluta');
            
            // Popuni dropdown menu
            this.populateDropdown(cryptos);
            
            // Generiši kripto grid (sakriven po defaultu)
            this.generateCryptoGrid(cryptos);
            
            // Učitaj detaljne podatke za Bitcoin
            await this.loadCryptoDetails(this.selectedCrypto, this.selectedTimeframe);
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju početnih podataka:', error);
            this.showError('Greška pri učitavanju podataka. Proverite da li je server pokrenut.');
        }
    }

    populateDropdown(cryptos) {
        const dropdown = document.getElementById('currency-select');
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Odaberite valutu...</option>';
        
        cryptos.forEach(crypto => {
            const option = document.createElement('option');
            const symbolName = crypto.symbol.replace('USDT', '');
            const cryptoIcon = this.cryptoIcons[symbolName] || '💰';
            
            option.value = crypto.symbol;
            option.textContent = `${cryptoIcon} ${symbolName} - $${crypto.price.toFixed(4)} (${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%)`;
            
            if (crypto.symbol === this.selectedCrypto) {
                option.selected = true;
            }
            
            dropdown.appendChild(option);
        });
        
        // Event listener za dropdown
        dropdown.addEventListener('change', (e) => {
            if (e.target.value) {
                this.selectCrypto(e.target.value);
            }
        });
        
        // Ažuriraj info panel
        this.updateSelectedCryptoInfo(cryptos.find(c => c.symbol === this.selectedCrypto));
    }

    updateSelectedCryptoInfo(crypto) {
        if (!crypto) return;
        
        const symbolName = crypto.symbol.replace('USDT', '');
        const changeClass = crypto.change >= 0 ? 'positive' : 'negative';
        
        document.querySelector('.selected-name').textContent = `${symbolName} (${crypto.symbol})`;
        document.querySelector('.selected-price').textContent = `$${crypto.price.toFixed(4)}`;
        document.querySelector('.selected-change').textContent = `${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%`;
        document.querySelector('.selected-change').className = changeClass;
    }

    generateCryptoGrid(cryptos) {
        const grid = document.getElementById('crypto-grid');
        if (!grid) return;

        grid.innerHTML = '';
        
        cryptos.forEach(crypto => {
            const card = this.createCryptoCard(crypto);
            grid.appendChild(card);
        });
    }

    createCryptoCard(crypto) {
        const card = document.createElement('div');
        card.className = 'crypto-card';
        card.dataset.symbol = crypto.symbol;
        
        const symbolName = crypto.symbol.replace('USDT', '');
        const cryptoIcon = this.cryptoIcons[symbolName] || '💰';
        const changeClass = crypto.change >= 0 ? 'positive' : 'negative';
        const changeIcon = crypto.change >= 0 ? '📈' : '📉';
        
        card.innerHTML = `
            <div class="crypto-header">
                <div class="crypto-icon">${cryptoIcon}</div>
                <div class="crypto-info">
                    <span class="crypto-symbol">${symbolName}</span>
                    <span class="crypto-price">$${crypto.price.toFixed(4)}</span>
                </div>
            </div>
            <div class="crypto-change ${changeClass}">
                ${changeIcon} ${crypto.change.toFixed(2)}%
            </div>
            <div class="crypto-volume">
                Vol: $${this.formatVolume(crypto.volume)}
            </div>
            <div class="crypto-signals">
                <div class="signal-indicator">
                    HOLD
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.selectCrypto(crypto.symbol);
        });

        return card;
    }

    async selectCrypto(symbol) {
        console.log('🎯 Biram kriptovalutu:', symbol);
        
        // Ukloni prethodnu selekciju
        document.querySelectorAll('.crypto-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Dodaj selekciju
        const selectedCard = document.querySelector(`[data-symbol="${symbol}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        this.selectedCrypto = symbol;
        await this.loadCryptoDetails(symbol, this.selectedTimeframe);
    }

    async loadCryptoDetails(symbol, timeframe) {
        try {
            console.log(`📈 Učitavam detalje za ${symbol} na ${timeframe}...`);
            
            // Koristi postojeće endpointe sa servera
            const [analysisData, predictions] = await Promise.all([
                fetch(`${this.apiUrl}/analyze/${symbol}/${timeframe}`).then(r => r.json()).catch(e => {
                    console.error('Greška pri učitavanju analize:', e);
                    return null;
                }),
                fetch(`${this.apiUrl}/predictions/${symbol}`).then(r => r.json()).catch(e => {
                    console.error('Greška pri učitavanju predviđanja:', e);
                    return null;
                })
            ]);
            
            console.log('📊 Podaci učitani:', { analysisData, predictions });
            
            // Ažuriraj indikatore
            if (analysisData) {
                this.updateTechnicalIndicators(analysisData);
            }
            
            // Ažuriraj predviđanja
            if (predictions) {
                this.updatePredictions(predictions);
            }
            
            // Ažuriraj multi-timeframe analizu
            await this.updateTimeframeAnalysis(symbol);
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju detalja:', error);
        }
    }

    updateTechnicalIndicators(data) {
        if (!data) return;
        
        console.log('🔧 Ažuriram tehničke indikatore:', data);
        
        // RSI
        const rsiElement = document.getElementById('rsi-value');
        const rsiSignalElement = document.getElementById('rsi-signal');
        if (rsiElement && data.indicators && data.indicators.rsi) {
            rsiElement.textContent = data.indicators.rsi.toFixed(2);
            if (rsiSignalElement) {
                rsiSignalElement.textContent = this.getRsiSignal(data.indicators.rsi);
                rsiSignalElement.className = `indicator-signal ${this.getRsiSignalColor(data.indicators.rsi)}`;
            }
        }
        
        // MACD
        const macdElement = document.getElementById('macd-value');
        const macdSignalElement = document.getElementById('macd-signal');
        if (macdElement && data.indicators && data.indicators.macd) {
            macdElement.textContent = data.indicators.macd.macd ? data.indicators.macd.macd.toFixed(4) : '--';
            if (macdSignalElement) {
                const macdSignal = data.indicators.macd.macd > 0 ? 'BUY' : 'SELL';
                macdSignalElement.textContent = macdSignal;
                macdSignalElement.className = `indicator-signal ${macdSignal.toLowerCase()}`;
            }
        }
        
        // Bollinger Bands
        const bbElement = document.getElementById('bb-value');
        if (bbElement && data.indicators && data.indicators.bb) {
            const price = data.price;
            const bb = data.indicators.bb;
            let bbSignal = 'NEUTRAL';
            if (price <= bb.lower) bbSignal = 'OVERSOLD';
            else if (price >= bb.upper) bbSignal = 'OVERBOUGHT';
            
            bbElement.textContent = `${bb.upper.toFixed(2)}/${bb.lower.toFixed(2)}`;
        }
        
        // Volume
        const volumeElement = document.getElementById('volume-value');
        const volumeSignalElement = document.getElementById('volume-signal');
        if (volumeElement && data.indicators && data.indicators.volume) {
            volumeElement.textContent = this.formatVolume(data.indicators.volume.current);
            if (volumeSignalElement) {
                const volumeSignal = data.indicators.volume.ratio > 1.5 ? 'HIGH' : 'NORMAL';
                volumeSignalElement.textContent = volumeSignal;
                volumeSignalElement.className = `indicator-signal ${volumeSignal.toLowerCase()}`;
            }
        }
        
        // Stochastic RSI
        const stochElement = document.getElementById('stoch-value');
        const stochSignalElement = document.getElementById('stoch-signal');
        if (stochElement && data.indicators && data.indicators.stochRSI) {
            stochElement.textContent = data.indicators.stochRSI.toFixed(2);
            if (stochSignalElement) {
                let stochSignal = 'NEUTRAL';
                if (data.indicators.stochRSI < 20) stochSignal = 'OVERSOLD';
                else if (data.indicators.stochRSI > 80) stochSignal = 'OVERBOUGHT';
                
                stochSignalElement.textContent = stochSignal;
                stochSignalElement.className = `indicator-signal ${stochSignal.toLowerCase()}`;
            }
        }
        
        // EMA
        const emaElement = document.getElementById('ema-value');
        const emaSignalElement = document.getElementById('ema-signal');
        if (emaElement && data.indicators) {
            const ema20 = data.indicators.ema20;
            const ema50 = data.indicators.ema50;
            if (ema20 && ema50) {
                emaElement.textContent = `${ema20.toFixed(2)}/${ema50.toFixed(2)}`;
                if (emaSignalElement) {
                    const emaSignal = ema20 > ema50 ? 'BULLISH' : 'BEARISH';
                    emaSignalElement.textContent = emaSignal;
                    emaSignalElement.className = `indicator-signal ${emaSignal.toLowerCase()}`;
                }
            }
        }
    }

    updatePredictions(predictions) {
        if (!predictions) return;
        
        console.log('🔮 Ažuriram predviđanja:', predictions);
        
        // Ažuriraj prediction meter za 15m, 1h, 24h
        const prediction15m = predictions['15m'];
        const prediction1h = predictions['1h'];  
        const prediction24h = predictions['24h'];
        
        // Kratkoročna predviđanja
        const next15mElement = document.getElementById('next-15m');
        const next1hElement = document.getElementById('next-1h');
        const next24hElement = document.getElementById('next-24h');
        
        if (next15mElement && prediction15m) {
            const changePercent = prediction15m.changePercent.toFixed(2);
            const direction = prediction15m.direction;
            const confidence = prediction15m.confidence.toFixed(1);
            next15mElement.textContent = `${direction} ${changePercent}% (${confidence}%)`;
            this.applyPredictionColors('next-15m', direction);
        }
        
        if (next1hElement && prediction1h) {
            const changePercent = prediction1h.changePercent.toFixed(2);
            const direction = prediction1h.direction;
            const confidence = prediction1h.confidence.toFixed(1);
            next1hElement.textContent = `${direction} ${changePercent}% (${confidence}%)`;
            this.applyPredictionColors('next-1h', direction);
        }
        
        if (next24hElement && prediction24h) {
            const changePercent = prediction24h.changePercent.toFixed(2);
            const direction = prediction24h.direction;
            const confidence = prediction24h.confidence.toFixed(1);
            next24hElement.textContent = `${direction} ${changePercent}% (${confidence}%)`;
            this.applyPredictionColors('next-24h', direction);
        }
        
        // Confidence score
        const confidenceElement = document.getElementById('confidence-score');
        if (confidenceElement && prediction15m) {
            confidenceElement.textContent = `${prediction15m.confidence.toFixed(1)}%`;
        }
        
        // Prediction meter
        const predictionFill = document.getElementById('prediction-fill');
        if (predictionFill && prediction15m) {
            predictionFill.style.width = `${prediction15m.confidence}%`;
        }
        
        // Target cene
        const predLowElement = document.getElementById('pred-low');
        const predCurrentElement = document.getElementById('pred-current');
        const predHighElement = document.getElementById('pred-high');
        
        if (predCurrentElement && prediction15m) {
            predCurrentElement.textContent = `$${prediction15m.current.toFixed(4)}`;
        }
        
        if (predHighElement && prediction1h) {
            predHighElement.textContent = `$${prediction1h.predicted.toFixed(4)}`;
        }
        
        if (predLowElement && prediction24h) {
            predLowElement.textContent = `$${prediction24h.predicted.toFixed(4)}`;
        }
    }

    applyPredictionColors(elementId, direction) {
        const element = document.getElementById(elementId);
        if (!element || !direction) return;
        
        element.className = 'move-prediction';
        if (direction === 'UP') {
            element.classList.add('bullish');
        } else if (direction === 'DOWN') {
            element.classList.add('bearish');
        } else {
            element.classList.add('neutral');
        }
    }

    async updateTimeframeAnalysis(symbol) {
        try {
            console.log(`📊 Učitavam multi-timeframe analizu za ${symbol}...`);
            
            // Koristi postojeći multi-timeframe endpoint
            const response = await fetch(`${this.apiUrl}/multi-timeframe/${symbol}`);
            if (!response.ok) {
                console.error('Greška pri učitavanju multi-timeframe podataka');
                return;
            }
            
            const data = await response.json();
            console.log('📈 Multi-timeframe podaci:', data);
            
            const timeframeGrid = document.getElementById('timeframe-grid');
            if (!timeframeGrid) return;
            
            timeframeGrid.innerHTML = '';
            
            // Prikaži dostupne timeframe-ove
            Object.keys(data).forEach(tf => {
                const tfData = data[tf];
                
                const panel = document.createElement('div');
                panel.className = 'timeframe-panel';
                
                const signal = tfData.signal ? tfData.signal.signal : 'HOLD';
                const signalClass = signal.toLowerCase().replace(' ', '-');
                const rsi = tfData.rsi ? tfData.rsi.toFixed(1) : '--';
                const price = tfData.price ? tfData.price.toFixed(4) : '--';
                
                panel.innerHTML = `
                    <div class="tf-header">${tf.toUpperCase()}</div>
                    <div class="tf-signal ${signalClass}">${signal}</div>
                    <div class="tf-rsi">RSI: ${rsi}</div>
                    <div class="tf-price">$${price}</div>
                `;
                
                timeframeGrid.appendChild(panel);
            });
            
        } catch (error) {
            console.error('❌ Greška pri ažuriranju timeframe analize:', error);
        }
    }

    async loadChart(symbol, timeframe) {
        // TODO: Implementirati chart kada bude dostupan chart-data endpoint
        console.log(`📊 Chart za ${symbol} ${timeframe} - endpoint nije implementiran`);
    }

    renderChart(data) {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Price',
                    data: data.prices,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#888'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#888'
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Timeframe buttons
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedTimeframe = e.target.dataset.tf;
                this.loadCryptoDetails(this.selectedCrypto, this.selectedTimeframe);
            });
        });

        // Toggle grid button
        const toggleBtn = document.getElementById('toggle-grid');
        const cryptoGrid = document.getElementById('crypto-grid');
        
        if (toggleBtn && cryptoGrid) {
            toggleBtn.addEventListener('click', () => {
                cryptoGrid.classList.toggle('hidden');
                toggleBtn.textContent = cryptoGrid.classList.contains('hidden') ? 
                    '👁️ PRIKAŽI SVE VALUTE' : '👁️ SAKRIJ SVE VALUTE';
            });
        }
    }

    startUpdates() {
        // Ažuriraj podatke svakih 10 sekundi
        this.updateInterval = setInterval(() => {
            this.loadInitialData();
        }, 10000);
        
        console.log('🔄 Pokrenuto kontinuirano ažuriranje (10s interval)');
    }

    // Helper funkcije
    formatVolume(volume) {
        if (!volume) return '0';
        if (volume >= 1e9) return (volume / 1e9).toFixed(1) + 'B';
        if (volume >= 1e6) return (volume / 1e6).toFixed(1) + 'M';
        if (volume >= 1e3) return (volume / 1e3).toFixed(1) + 'K';
        return volume.toFixed(0);
    }

    getSignalColor(signal) {
        if (!signal) return 'neutral';
        if (signal.includes('BUY') || signal.includes('STRONG BUY')) return 'bullish';
        if (signal.includes('SELL') || signal.includes('STRONG SELL')) return 'bearish';
        return 'neutral';
    }

    getSignalText(signal) {
        return signal || 'HOLD';
    }

    getRsiSignal(rsi) {
        if (!rsi) return 'N/A';
        if (rsi > 70) return 'OVERBOUGHT';
        if (rsi < 30) return 'OVERSOLD';
        if (rsi > 60) return 'BULLISH';
        if (rsi < 40) return 'BEARISH';
        return 'NEUTRAL';
    }

    getRsiSignalColor(rsi) {
        if (!rsi) return 'neutral';
        if (rsi > 70 || rsi < 30) return 'warning';
        if (rsi > 60) return 'bullish';
        if (rsi < 40) return 'bearish';
        return 'neutral';
    }

    getOverallSignal(data) {
        if (!data) return 'HOLD';
        
        let bullishSignals = 0;
        let bearishSignals = 0;
        
        // Proverava različite signale
        if (data.rsi && data.rsi < 30) bullishSignals++;
        if (data.rsi && data.rsi > 70) bearishSignals++;
        if (data.macdSignal === 'BUY') bullishSignals++;
        if (data.macdSignal === 'SELL') bearishSignals++;
        if (data.emaSignal === 'BUY') bullishSignals++;
        if (data.emaSignal === 'SELL') bearishSignals++;
        
        if (bullishSignals > bearishSignals) return 'BUY';
        if (bearishSignals > bullishSignals) return 'SELL';
        return 'HOLD';
    }

    getTrendArrow(trend) {
        if (!trend) return '➡️';
        if (trend === 'up') return '⬆️';
        if (trend === 'down') return '⬇️';
        return '➡️';
    }

    showError(message) {
        console.error('🚨 ERROR:', message);
        
        // Prikaži error u UI
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

// Inicijalizuj dashboard kada se stranica učita
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, pokretam Trading Dashboard...');
    window.tradingDashboard = new TradingDashboard();
});

// Cleanup kada se stranica zatvara
window.addEventListener('beforeunload', () => {
    if (window.tradingDashboard) {
        window.tradingDashboard.destroy();
    }
});
