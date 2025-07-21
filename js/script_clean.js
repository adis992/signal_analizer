class TradingDashboard {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.cryptoData = {};
        this.selectedCrypto = 'BTCUSDT';
        this.selectedTimeframe = '1m';
        this.chart = null;
        this.updateInterval = null;
        
        // Crypto ikone
        this.cryptoIcons = {
            'BTC': '₿', 'ETH': 'Ξ', 'BNB': '🔸', 'SOL': '◉', 'XRP': '◈',
            'ADA': '◊', 'DOT': '●', 'LINK': '🔗', 'LTC': 'Ł', 'BCH': '₿',
            'XLM': '★', 'UNI': '🦄', 'VET': '⚡', 'TRX': '🔺', 'FIL': '📁',
            'AAVE': '👻', 'MATIC': '🔷', 'ATOM': '⚛️', 'NEAR': '🌙', 'AVAX': '🔺',
            'FTM': '👻', 'ALGO': '◯', 'ICP': '∞', 'SAND': '🏖️', 'MANA': '🌍',
            'AXS': '⚔️', 'THETA': 'θ', 'MKR': '🔨', 'COMP': '🏛️', 'SUSHI': '🍣',
            'YFI': '🔮', 'CRV': '💎', 'SNX': '⚡', '1INCH': '🗂️', 'ENJ': '🎮'
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicijalizujem Trading Dashboard...');
        
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        await this.loadInitialData();
        this.setupEventListeners();
        this.startUpdates();
        
        console.log('✅ Dashboard uspešno inicijalizovan!');
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('sr-RS', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const updateElement = document.getElementById('last-update-time');
        if (updateElement) {
            updateElement.textContent = timeString;
        }
    }

    async loadInitialData() {
        try {
            console.log('📊 Učitavam početne podatke...');
            
            const response = await fetch(`${this.apiUrl}/crypto-list`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const cryptos = await response.json();
            console.log('💰 Učitano', cryptos.length, 'kriptovaluta');
            
            this.populateDropdown(cryptos);
            this.generateCryptoGrid(cryptos);
            await this.loadCryptoDetails(this.selectedCrypto, this.selectedTimeframe);
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju početnih podataka:', error);
            this.showError('Greška pri učitavanju podataka. Proverite da li je server pokrenut.');
        }
    }

    populateDropdown(cryptos) {
        const dropdown = document.getElementById('currency-select');
        if (!dropdown) {
            console.error('❌ Dropdown element ne postoji!');
            return;
        }

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
        
        dropdown.addEventListener('change', (e) => {
            if (e.target.value) {
                this.selectCrypto(e.target.value);
            }
        });
        
        this.updateSelectedCryptoInfo(cryptos.find(c => c.symbol === this.selectedCrypto));
        console.log('✅ Dropdown popunjen sa', cryptos.length, 'valuta');
    }

    updateSelectedCryptoInfo(crypto) {
        if (!crypto) return;
        
        const selectedName = document.querySelector('.selected-name');
        const selectedPrice = document.querySelector('.selected-price');
        const selectedChange = document.querySelector('.selected-change');
        
        if (selectedName && selectedPrice && selectedChange) {
            const symbolName = crypto.symbol.replace('USDT', '');
            selectedName.textContent = `${symbolName} (${crypto.symbol})`;
            selectedPrice.textContent = `$${crypto.price.toFixed(4)}`;
            selectedChange.textContent = `${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%`;
            selectedChange.className = crypto.change >= 0 ? 'positive' : 'negative';
        }
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
                <div class="signal-indicator">HOLD</div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.selectCrypto(crypto.symbol);
        });

        return card;
    }

    async selectCrypto(symbol) {
        console.log('🎯 Biram kriptovalutu:', symbol);
        
        document.querySelectorAll('.crypto-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-symbol="${symbol}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Ažuriraj dropdown
        const dropdown = document.getElementById('currency-select');
        if (dropdown) {
            dropdown.value = symbol;
        }
        
        this.selectedCrypto = symbol;
        await this.loadCryptoDetails(symbol, this.selectedTimeframe);
    }

    async loadCryptoDetails(symbol, timeframe) {
        try {
            console.log(`📈 Učitavam detalje za ${symbol} na ${timeframe}...`);
            
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
            
            if (analysisData) {
                this.updateTechnicalIndicators(analysisData);
                this.calculateOverallAccuracy(analysisData);
            }
            
            if (predictions) {
                this.updatePredictions(predictions);
            }
            
            await this.updateTimeframeAnalysis(symbol);
            await this.loadChart(symbol, timeframe);
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju detalja:', error);
        }
    }

    async loadChart(symbol, timeframe) {
        try {
            console.log(`📈 Učitavam grafikon za ${symbol} na ${timeframe}...`);
            
            const chartResponse = await fetch(`${this.apiUrl}/chart-data/${symbol}/${timeframe}`);
            if (!chartResponse.ok) {
                console.log(`ℹ️ Chart endpoint nije dostupan za ${symbol}`);
                return;
            }
            
            const chartData = await chartResponse.json();
            
            const canvas = document.getElementById('price-chart');
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            
            if (this.chart) {
                this.chart.destroy();
            }
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `${symbol.replace('USDT', '')} - ${timeframe.toUpperCase()}`,
                            color: '#ffffff',
                            font: { size: 16, weight: 'bold' }
                        },
                        legend: {
                            labels: { color: '#ffffff' }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#cccccc' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: { 
                                color: '#cccccc',
                                callback: function(value) {
                                    return '$' + value.toFixed(4);
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    },
                    elements: {
                        point: { radius: 2, hoverRadius: 6 }
                    }
                }
            });
            
            console.log('✅ Grafikon uspešno učitan!');
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju grafikona:', error);
        }
    }

    updateTechnicalIndicators(data) {
        if (!data) return;
        
        console.log('🔧 Ažuriram tehničke indikatore:', data);
        
        // RSI
        const rsiValue = document.getElementById('rsi-value');
        const rsiSignal = document.getElementById('rsi-signal');
        const rsiFill = document.getElementById('rsi-fill');
        
        if (rsiValue && data.indicators && data.indicators.rsi !== null) {
            const rsi = data.indicators.rsi;
            rsiValue.textContent = rsi.toFixed(2);
            
            if (rsiSignal) {
                let signal = 'NEUTRAL';
                let signalClass = 'neutral';
                
                if (rsi > 70) { signal = 'OVERBOUGHT'; signalClass = 'bearish'; }
                else if (rsi < 30) { signal = 'OVERSOLD'; signalClass = 'bullish'; }
                else if (rsi > 60) { signal = 'BULLISH'; signalClass = 'bullish'; }
                else if (rsi < 40) { signal = 'BEARISH'; signalClass = 'bearish'; }
                
                rsiSignal.textContent = signal;
                rsiSignal.className = `indicator-signal ${signalClass}`;
            }
            
            if (rsiFill) {
                rsiFill.style.width = `${rsi}%`;
            }
        }
        
        // MACD
        const macdValue = document.getElementById('macd-value');
        const macdSignal = document.getElementById('macd-signal');
        
        if (macdValue && data.indicators && data.indicators.macd) {
            const macd = data.indicators.macd.macd;
            macdValue.textContent = macd ? macd.toFixed(4) : '--';
            
            if (macdSignal && macd !== null) {
                const signal = macd > 0 ? 'BULLISH' : 'BEARISH';
                const signalClass = macd > 0 ? 'bullish' : 'bearish';
                
                macdSignal.textContent = signal;
                macdSignal.className = `indicator-signal ${signalClass}`;
            }
        }
        
        // Bollinger Bands
        const bbValue = document.getElementById('bb-value');
        const bbSignal = document.getElementById('bb-signal');
        
        if (bbValue && data.indicators && data.indicators.bb) {
            const price = data.price;
            const bb = data.indicators.bb;
            
            bbValue.textContent = `${bb.upper.toFixed(2)}/${bb.lower.toFixed(2)}`;
            
            if (bbSignal) {
                let signal = 'NEUTRAL';
                let signalClass = 'neutral';
                
                if (price <= bb.lower) { signal = 'OVERSOLD'; signalClass = 'bullish'; }
                else if (price >= bb.upper) { signal = 'OVERBOUGHT'; signalClass = 'bearish'; }
                
                bbSignal.textContent = signal;
                bbSignal.className = `indicator-signal ${signalClass}`;
            }
        }
        
        // Volume
        const volumeValue = document.getElementById('volume-value');
        const volumeSignal = document.getElementById('volume-signal');
        
        if (volumeValue && data.indicators && data.indicators.volume) {
            const volume = data.indicators.volume;
            volumeValue.textContent = this.formatVolume(volume.current);
            
            if (volumeSignal) {
                const signal = volume.ratio > 1.5 ? 'HIGH' : 'NORMAL';
                const signalClass = volume.ratio > 1.5 ? 'bullish' : 'neutral';
                
                volumeSignal.textContent = signal;
                volumeSignal.className = `indicator-signal ${signalClass}`;
            }
        }
        
        // Stochastic RSI
        const stochValue = document.getElementById('stoch-value');
        const stochSignal = document.getElementById('stoch-signal');
        
        if (stochValue && data.indicators && data.indicators.stochRSI !== null) {
            const stochRSI = data.indicators.stochRSI;
            stochValue.textContent = stochRSI.toFixed(2);
            
            if (stochSignal) {
                let signal = 'NEUTRAL';
                let signalClass = 'neutral';
                
                if (stochRSI < 20) { signal = 'OVERSOLD'; signalClass = 'bullish'; }
                else if (stochRSI > 80) { signal = 'OVERBOUGHT'; signalClass = 'bearish'; }
                
                stochSignal.textContent = signal;
                stochSignal.className = `indicator-signal ${signalClass}`;
            }
        }
        
        // EMA
        const emaValue = document.getElementById('ema-value');
        const emaSignal = document.getElementById('ema-signal');
        
        if (emaValue && data.indicators) {
            const ema20 = data.indicators.ema20;
            const ema50 = data.indicators.ema50;
            const price = data.price;
            
            if (ema20 && ema50) {
                emaValue.textContent = `${ema20.toFixed(2)}/${ema50.toFixed(2)}`;
                
                if (emaSignal) {
                    let signal = 'NEUTRAL';
                    let signalClass = 'neutral';
                    
                    if (price > ema20 && ema20 > ema50) { signal = 'BULLISH'; signalClass = 'bullish'; }
                    else if (price < ema20 && ema20 < ema50) { signal = 'BEARISH'; signalClass = 'bearish'; }
                    
                    emaSignal.textContent = signal;
                    emaSignal.className = `indicator-signal ${signalClass}`;
                }
            }
        }
    }

    calculateOverallAccuracy(data) {
        if (!data || !data.indicators) return;
        
        let bullishSignals = 0;
        let bearishSignals = 0;
        let totalSignals = 0;
        
        const indicators = data.indicators;
        const price = data.price;
        
        // RSI
        if (indicators.rsi !== null) {
            totalSignals++;
            if (indicators.rsi < 30) bullishSignals++;
            else if (indicators.rsi > 70) bearishSignals++;
        }
        
        // MACD
        if (indicators.macd && indicators.macd.macd !== null) {
            totalSignals++;
            if (indicators.macd.macd > 0) bullishSignals++;
            else bearishSignals++;
        }
        
        // Bollinger Bands
        if (indicators.bb) {
            totalSignals++;
            if (price <= indicators.bb.lower) bullishSignals++;
            else if (price >= indicators.bb.upper) bearishSignals++;
        }
        
        // Volume
        if (indicators.volume) {
            totalSignals++;
            if (indicators.volume.ratio > 1.5) bullishSignals++;
        }
        
        // Stochastic RSI
        if (indicators.stochRSI !== null) {
            totalSignals++;
            if (indicators.stochRSI < 20) bullishSignals++;
            else if (indicators.stochRSI > 80) bearishSignals++;
        }
        
        // EMA
        if (indicators.ema20 && indicators.ema50) {
            totalSignals++;
            if (price > indicators.ema20 && indicators.ema20 > indicators.ema50) bullishSignals++;
            else if (price < indicators.ema20 && indicators.ema20 < indicators.ema50) bearishSignals++;
        }
        
        // Izračunaj ukupnu tačnost
        let accuracy = 50; // Bazična vrednost
        let consensus = 'NEUTRAL';
        
        if (totalSignals > 0) {
            const bullishPercentage = (bullishSignals / totalSignals) * 100;
            const bearishPercentage = (bearishSignals / totalSignals) * 100;
            
            if (bullishPercentage >= 60) {
                accuracy = Math.min(95, 50 + bullishPercentage);
                consensus = 'STRONG BUY';
            } else if (bearishPercentage >= 60) {
                accuracy = Math.min(95, 50 + bearishPercentage);
                consensus = 'STRONG SELL';
            } else if (bullishPercentage > bearishPercentage) {
                accuracy = 50 + (bullishPercentage - bearishPercentage);
                consensus = 'BUY';
            } else if (bearishPercentage > bullishPercentage) {
                accuracy = 50 + (bearishPercentage - bullishPercentage);
                consensus = 'SELL';
            }
        }
        
        // Ažuriraj UI
        const accuracyFill = document.getElementById('accuracy-fill');
        const accuracyPercentage = document.getElementById('accuracy-percentage');
        const signalConsensus = document.getElementById('signal-consensus');
        
        if (accuracyFill) {
            accuracyFill.style.width = `${accuracy}%`;
        }
        
        if (accuracyPercentage) {
            accuracyPercentage.textContent = accuracy.toFixed(1);
        }
        
        if (signalConsensus) {
            signalConsensus.textContent = consensus;
            signalConsensus.className = `signal-consensus ${consensus.toLowerCase().replace(' ', '-')}`;
        }
    }

    updatePredictions(predictions) {
        if (!predictions) return;
        
        console.log('🔮 Ažuriram predviđanja:', predictions);
        
        // Ažuriraj predviđanja za 1m, 3m, 15m
        const pred15m = document.getElementById('pred-15m');
        const conf15m = document.getElementById('conf-15m');
        const pred1h = document.getElementById('pred-1h');
        const conf1h = document.getElementById('conf-1h');
        const pred24h = document.getElementById('pred-24h');
        const conf24h = document.getElementById('conf-24h');
        
        // 1 minuta predviđanje
        if (predictions['1m'] && pred15m && conf15m) {
            const p = predictions['1m'];
            pred15m.textContent = `${p.direction} ${p.changePercent.toFixed(2)}%`;
            conf15m.textContent = `${p.confidence.toFixed(1)}% tačnost`;
            pred15m.className = `prediction-value ${p.direction.toLowerCase()}`;
        }
        
        // 3 minuta predviđanje  
        if (predictions['3m'] && pred1h && conf1h) {
            const p = predictions['3m'];
            pred1h.textContent = `${p.direction} ${p.changePercent.toFixed(2)}%`;
            conf1h.textContent = `${p.confidence.toFixed(1)}% tačnost`;
            pred1h.className = `prediction-value ${p.direction.toLowerCase()}`;
        }
        
        // 15 minuta predviđanje
        if (predictions['15m'] && pred24h && conf24h) {
            const p = predictions['15m'];
            pred24h.textContent = `${p.direction} ${p.changePercent.toFixed(2)}%`;
            conf24h.textContent = `${p.confidence.toFixed(1)}% tačnost`;
            pred24h.className = `prediction-value ${p.direction.toLowerCase()}`;
        }
    }

    async updateTimeframeAnalysis(symbol) {
        try {
            console.log(`📊 Učitavam multi-timeframe analizu za ${symbol}...`);
            
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

    showError(message) {
        console.error('🚨 ERROR:', message);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: #ff4444;
            color: white; padding: 15px; border-radius: 8px; z-index: 10000;
            max-width: 300px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM učitan, pokrećem Trading Dashboard...');
    window.tradingDashboard = new TradingDashboard();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    if (window.tradingDashboard) {
        window.tradingDashboard.destroy();
    }
});
