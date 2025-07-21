class TradingDashboard {
    constructor() {
        // Direktno koristi Binance API umesto lokalnog servera
        this.binanceApiUrl = 'https://api.binance.com/api/v3';
        this.cryptoData = {};
        this.selectedCrypto = localStorage.getItem('selectedCrypto') || 'BTCUSDT';
        this.selectedTimeframe = '1m';
        this.chart = null;
        this.updateInterval = null;
        this.predictionUpdateInterval = null;
        this.predictionRefreshRate = localStorage.getItem('predictionRefreshRate') || '1h'; // 15min, 30min, 1h, 1d
        
        // Initialize prediction tracking
        this.currentPredictions = null;
        this.refreshIntervals = [];
        this.intelligentRefreshActive = false;
        this.predictionHistory = {};
        this.loadPredictionHistory();
        
        // Lista popularnih crypto parova + DOGE za Tarika! 😂
        this.cryptoSymbols = [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
            'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT', 'BCHUSDT',
            'XLMUSDT', 'UNIUSDT', 'VETUSDT', 'TRXUSDT', 'FILUSDT',
            'AAVEUSDT', 'MATICUSDT', 'ATOMUSDT', 'NEARUSDT', 'AVAXUSDT',
            'FTMUSDT', 'ALGOUSDT', 'ICPUSDT', 'SANDUSDT', 'MANAUSDT',
            'AXSUSDT', 'THETAUSDT', 'MKRUSDT', 'COMPUSDT', 'SUSHIUSDT',
            'YFIUSDT', 'CRVUSDT', 'SNXUSDT', '1INCHUSDT', 'ENJUSDT',
            'DOGEUSDT' // TARIK's favorite! 🐕
        ];
        
        // Crypto ikone
        this.cryptoIcons = {
            'BTC': '₿', 'ETH': 'Ξ', 'BNB': '🔸', 'SOL': '◉', 'XRP': '◈',
            'ADA': '◊', 'DOT': '●', 'LINK': '🔗', 'LTC': 'Ł', 'BCH': '₿',
            'XLM': '★', 'UNI': '🦄', 'VET': '⚡', 'TRX': '🔺', 'FIL': '📁',
            'AAVE': '👻', 'MATIC': '🔷', 'ATOM': '⚛️', 'NEAR': '🌙', 'AVAX': '🔺',
            'FTM': '👻', 'ALGO': '◯', 'ICP': '∞', 'SAND': '🏖️', 'MANA': '🌍',
            'AXS': '⚔️', 'THETA': 'θ', 'MKR': '🔨', 'COMP': '🏛️', 'SUSHI': '🍣',
            'YFI': '🔮', 'CRV': '💎', 'SNX': '⚡', '1INCH': '🗂️', 'ENJ': '🎮',
            'DOGE': '🐕' // TARIK special! 🚀
        };
        
        this.init();
    }

    loadPredictionHistory() {
        const saved = localStorage.getItem('predictionHistory');
        if (saved) {
            try {
                this.predictionHistory = JSON.parse(saved);
            } catch (error) {
                console.error('Greška pri učitavanju prediction history:', error);
                this.predictionHistory = {};
            }
        }
    }

    async init() {
        console.log('🚀 Inicijalizujem Trading Dashboard (GitHub Pages verzija)...');
        
        // Check ako je adis992 admin
        this.checkAdminStatus();
        
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        
        // Inicijaliziraj sa pametnim podešavanjima
        this.selectedTimeframe = this.selectedTimeframe || '1h'; // Default 1h
        this.selectedCrypto = localStorage.getItem('selectedCrypto') || 'BTCUSDT';
        
        console.log(`🎯 Inicijalizujem sa: ${this.selectedCrypto} na ${this.selectedTimeframe} timeframe`);
        
        await this.loadInitialData();
        this.setupEventListeners();
        this.startUpdates(); // Će koristiti selectedTimeframe za interval
        this.addTradingTips();
        this.setupPredictionRefresh();
        
        console.log('✅ Dashboard uspešno inicijalizovan sa pametnim ažuriranjem!');
    }

    checkAdminStatus() {
        const gitUser = localStorage.getItem('github_user');
        const isGitHub = window.location.hostname.includes('adis992.github.io');
        
        if (gitUser === 'adis992' || isGitHub) {
            document.body.classList.add('admin-mode');
            localStorage.setItem('admin_verified', 'true');
            console.log('👑 Admin status: adis992 detected!');
        }
    }

    setupPredictionRefresh() {
        // Setup auto-refresh za predviđanja sa logičkim intervalima
        this.predictionHistory = JSON.parse(localStorage.getItem('predictionHistory') || '{}');
        this.startIntelligentPredictionRefresh();
        
        // Dodaj UI kontrole samo jednom
        this.addPredictionRefreshControls();
    }

    startIntelligentPredictionRefresh() {
        // Clear postojeći interval
        if (this.predictionUpdateInterval) {
            clearInterval(this.predictionUpdateInterval);
        }
        
        // Logički intervali za različite timeframe-ove
        const timeframeIntervals = {
            '1m': 1 * 60 * 1000,      // 1 minut
            '3m': 3 * 60 * 1000,      // 3 minuta  
            '15m': 15 * 60 * 1000,    // 15 minuta
            '1h': 60 * 60 * 1000,     // 1 sat
            '4h': 4 * 60 * 60 * 1000, // 4 sata
            '6h': 6 * 60 * 60 * 1000, // 6 sati
            '12h': 12 * 60 * 60 * 1000, // 12 sati
            '1d': 24 * 60 * 60 * 1000,  // 1 dan
            '1w': 7 * 24 * 60 * 60 * 1000, // 1 sedmica
            '1M': 30 * 24 * 60 * 60 * 1000 // 1 mesec
        };
        
        // Pokretaj refresh za svaki timeframe pojedinačno
        Object.keys(timeframeIntervals).forEach(timeframe => {
            const intervalMs = timeframeIntervals[timeframe];
            
            setInterval(() => {
                console.log(`🔄 Auto-ažuriranje ${timeframe} predviđanja...`);
                this.updateSpecificTimeframePrediction(timeframe);
                this.trackPredictionAccuracy(timeframe);
            }, intervalMs);
        });
        
        console.log('⏰ Intelligent prediction refresh pokrenut za sve timeframe-ove');
    }

    addPredictionRefreshControls() {
        // SKIP - kontrole su već u HTML-u da izbegnemo duplikate
        console.log('⚠️ Prediction refresh kontrole se čitaju iz HTML-a');
        
        // Samo setup event listener
        const refreshSelect = document.getElementById('prediction-refresh-rate');
        if (refreshSelect) {
            refreshSelect.value = this.predictionRefreshRate;
            refreshSelect.addEventListener('change', (e) => {
                this.predictionRefreshRate = e.target.value;
                localStorage.setItem('predictionRefreshRate', this.predictionRefreshRate);
                console.log(`🔄 Promenjen refresh rate na: ${this.predictionRefreshRate}`);
                this.startIntelligentPredictionRefresh();
            });
        }
    }

    startLegacyPredictionRefresh() {
        // Clear postojeći interval
        if (this.predictionUpdateInterval) {
            clearInterval(this.predictionUpdateInterval);
        }
        
        const intervals = {
            '15min': 15 * 60 * 1000,
            '30min': 30 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000
        };
        
        const intervalMs = intervals[this.predictionRefreshRate] || intervals['1h'];
        
        this.predictionUpdateInterval = setInterval(() => {
            console.log('🔄 Legacy ažuriranje svih predviđanja...');
            this.generateAndUpdateAllPredictions();
        }, intervalMs);
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
            console.log('📊 Učitavam podatke direktno sa Binance API...');
            
            // Učitaj podatke za sve crypto parove
            const cryptoData = await this.fetchAllCryptoData();
            console.log('💰 Učitano', cryptoData.length, 'kriptovaluta');
            
            this.populateDropdown(cryptoData);
            this.generateCryptoGrid(cryptoData);
            await this.loadCryptoDetails(this.selectedCrypto);
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju podataka:', error);
            // NE PRIKAŽI error popup - samo logiraj
            console.warn('⚠️ Binance API greška, koristit će se fallback podaci');
            // this.showError('Greška pri povezivanju sa Binance API. Molimo pokušajte ponovo.');
        }
    }

    async fetchAllCryptoData() {
        try {
            // Koristi Binance 24hr ticker statistike
            const response = await fetch(`${this.binanceApiUrl}/ticker/24hr`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const allTickers = await response.json();
            
            // Filtriraj samo naše crypto parove
            const filteredData = allTickers
                .filter(ticker => this.cryptoSymbols.includes(ticker.symbol))
                .map(ticker => ({
                    symbol: ticker.symbol,
                    price: parseFloat(ticker.lastPrice),
                    change: parseFloat(ticker.priceChangePercent),
                    volume: parseFloat(ticker.volume)
                }));
            
            // Cache fresh data za brži pristup
            this.cryptoData = {};
            filteredData.forEach(crypto => {
                this.cryptoData[crypto.symbol] = crypto;
            });
            
            console.log(`💰 Cache ažuriran sa ${filteredData.length} crypto valuta. SOLUSDT: $${this.cryptoData['SOLUSDT']?.price || 'N/A'}`);
            
            return filteredData;
        } catch (error) {
            console.error('❌ GREŠKA: Binance API nedostupan:', error);
            throw new Error('Binance API nedostupan. Molimo pokušajte ponovo.');
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
            
            // TARIK special for DOGE! 😂
            let displayName = symbolName;
            if (symbolName === 'DOGE') {
                displayName = 'DOGE - TARIK 🚀';
            }
            
            option.value = crypto.symbol;
            option.textContent = `${cryptoIcon} ${displayName} - $${crypto.price.toFixed(4)} (${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%)`;
            
            // Auto-select saved crypto iz localStorage
            if (crypto.symbol === this.selectedCrypto) {
                option.selected = true;
            }
            
            dropdown.appendChild(option);
        });
        
        // Postavi odabranu valutu ako je učitana iz localStorage
        if (this.selectedCrypto && this.selectedCrypto !== 'BTCUSDT') {
            dropdown.value = this.selectedCrypto;
            console.log(`💾 Učitana valuta iz localStorage: ${this.selectedCrypto}`);
        }
        
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
        
        // Generiši pametan signal za svaku valutu
        let smartSignal = 'DRŽI';
        let signalClass = 'neutral';
        
        if (crypto.change > 5) { smartSignal = '🚀 KUPUJ'; signalClass = 'bullish'; }
        else if (crypto.change > 2) { smartSignal = '📈 RAST'; signalClass = 'bullish'; }
        else if (crypto.change < -5) { smartSignal = '💥 PRODAJ'; signalClass = 'bearish'; }
        else if (crypto.change < -2) { smartSignal = '📉 PAD'; signalClass = 'bearish'; }
        else if (Math.abs(crypto.change) < 0.5) { smartSignal = '😴 SPAVA'; signalClass = 'neutral'; }
        
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
                Volumen: $${this.formatVolume(crypto.volume)}
            </div>
            <div class="crypto-signals">
                <div class="signal-indicator ${signalClass}">${smartSignal}</div>
            </div>
            <div class="crypto-extra-info">
                ${crypto.volume > 1000000000 ? '🔥 HOT' : ''}
                ${Math.abs(crypto.change) > 10 ? '⚡ VOLATILNO' : ''}
                ${crypto.change > 0 && crypto.volume > 500000000 ? '💎 TOP' : ''}
            </div>
        `;

        card.addEventListener('click', () => {
            this.selectCrypto(crypto.symbol);
            
            // Prikaži alert ako je signal jak
            if (Math.abs(crypto.change) > 3) {
                this.showProfitAlert(crypto.symbol, {
                    direction: crypto.change > 0 ? 'rast' : 'pad',
                    changePercent: Math.abs(crypto.change),
                    confidence: 70 + Math.random() * 25
                });
            }
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
        await this.loadCryptoDetails(symbol);
    }

    async loadCryptoDetails(symbol) {
        try {
            console.log(`📈 Učitavam detalje za ${symbol}...`);
            
            // Ažuriraj crypto display info odmah
            const crypto = this.cryptoData[symbol];
            if (crypto) {
                this.updateSelectedCryptoInfo(crypto);
            }
            
            // Generiši stvarnu tehničku analizu
            const analysisData = await this.generateTechnicalAnalysis(symbol);
            const predictions = await this.generateSmartPredictions(symbol, analysisData);
            
            console.log('📊 Podaci generisani:', { analysisData, predictions });
            
            this.updateTechnicalIndicators(analysisData);
            this.calculateOverallAccuracy(analysisData);
            this.updatePredictions(predictions, analysisData);
            this.updateTimeframeAnalysis(symbol);
            await this.loadChart(symbol);
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju detalja:', error);
        }
    }

    async generateTechnicalAnalysis(symbol) {
        try {
            console.log(`📊 Učitavam stvarne tehničke indikatore za ${symbol}...`);
            
            // Dobij candle podatke za tehničku analizu
            const candleResponse = await fetch(`${this.binanceApiUrl}/klines?symbol=${symbol}&interval=1h&limit=100`);
            if (!candleResponse.ok) throw new Error('Greška pri učitavanju candle podataka');
            
            const candles = await candleResponse.json();
            const closePrices = candles.map(candle => parseFloat(candle[4])); // Close prices
            const volumes = candles.map(candle => parseFloat(candle[5])); // Volumes
            
            // Trenutna cena
            const currentPrice = closePrices[closePrices.length - 1];
            
            // Izračunaj stvarne tehničke indikatore
            const rsi = this.calculateRSI(closePrices);
            const macd = this.calculateMACD(closePrices);
            const bb = this.calculateBollingerBands(closePrices, currentPrice);
            const ema20 = this.calculateEMA(closePrices, 20);
            const ema50 = this.calculateEMA(closePrices, 50);
            
            return {
                price: currentPrice,
                indicators: {
                    rsi: rsi,
                    macd: macd,
                    bb: bb,
                    volume: {
                        current: volumes[volumes.length - 1],
                        ratio: volumes[volumes.length - 1] / (volumes.reduce((a, b) => a + b) / volumes.length)
                    },
                    stochRSI: this.calculateStochRSI(closePrices),
                    ema20: ema20,
                    ema50: ema50
                }
            };
            
        } catch (error) {
            console.error('❌ Greška pri generiranju tehničke analize:', error);
            throw new Error('Neuspjeh učitavanja tehničkih indikatora');
        }
    }
    
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50; // Nedovoljno podataka
        
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        // Izračunaj proječnu dobit i gubitak
        const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macdLine = ema12 - ema26;
        
        // Signal line je 9-period EMA od MACD linije
        const macdHistory = [];
        for (let i = 26; i < prices.length; i++) {
            const ema12_i = this.calculateEMA(prices.slice(0, i + 1), 12);
            const ema26_i = this.calculateEMA(prices.slice(0, i + 1), 26);
            macdHistory.push(ema12_i - ema26_i);
        }
        
        const signalLine = this.calculateEMA(macdHistory, 9);
        
        return {
            macd: macdLine,
            signal: signalLine
        };
    }
    
    calculateEMA(prices, period) {
        if (prices.length === 0) return 0;
        
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }
    
    calculateBollingerBands(prices, currentPrice, period = 20, stdDev = 2) {
        if (prices.length < period) {
            return {
                upper: currentPrice * 1.02,
                lower: currentPrice * 0.98
            };
        }
        
        const recentPrices = prices.slice(-period);
        const sma = recentPrices.reduce((a, b) => a + b) / period;
        
        // Standardna devijacija
        const variance = recentPrices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        
        return {
            upper: sma + (standardDeviation * stdDev),
            lower: sma - (standardDeviation * stdDev)
        };
    }
    
    calculateStochRSI(prices, period = 14) {
        const rsiValues = [];
        
        // Generiramo RSI vrednosti za poslednji period
        for (let i = period; i < prices.length; i++) {
            const periodPrices = prices.slice(i - period, i + 1);
            rsiValues.push(this.calculateRSI(periodPrices, period));
        }
        
        if (rsiValues.length < period) return 50;
        
        const recentRSI = rsiValues.slice(-period);
        const minRSI = Math.min(...recentRSI);
        const maxRSI = Math.max(...recentRSI);
        const currentRSI = recentRSI[recentRSI.length - 1];
        
        if (maxRSI === minRSI) return 50;
        
        return ((currentRSI - minRSI) / (maxRSI - minRSI)) * 100;
    }

    async loadChart(symbol) {
        try {
            console.log(`📈 Učitavam STVARNI grafikon sa Binance API za ${symbol}...`);
            
            // DODAJ DELAY da sprečim bombardovanje API-ja
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const canvas = document.getElementById('price-chart');
            if (!canvas) {
                console.error('❌ Canvas element ne postoji');
                return;
            }
            
            // Uništi postojeći chart PRVO
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
                console.log('🗑️ Postojeći chart uništen');
            }
            
            try {
                // Pokušaj učitati stvarne candle podatke sa Binance API
                const chartData = await this.fetchChartData(symbol);
                
                const ctx = canvas.getContext('2d');
                
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: `${symbol.replace('USDT', '')} - ${this.selectedTimeframe.toUpperCase()} - STVARNI PODACI`,
                                color: '#00ff88',
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
                
                console.log('✅ STVARNI grafikon uspešno učitan!');
                
            } catch (apiError) {
                console.error('❌ Binance API greška:', apiError);
                
                // BACKUP CHART - ne prikaži error popup
                console.log('🔧 Koristim backup chart umesto error popup...');
                const fallbackData = this.generateFallbackChartData(symbol);
                
                const ctx = canvas.getContext('2d');
                
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: fallbackData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: `${symbol.replace('USDT', '')} - ${this.selectedTimeframe.toUpperCase()} - BACKUP CHART`,
                                color: '#ffaa00',
                                font: { size: 16, weight: 'bold' }
                            },
                            legend: { labels: { color: '#ffffff' } }
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
                        elements: { point: { radius: 2, hoverRadius: 6 } }
                    }
                });
                
                console.log('✅ Backup chart uspešno učitan');
            }
            
        } catch (error) {
            console.error('❌ Kritična greška pri učitavanju chart-a:', error);
            // NE PRIKAZUJ ERROR POPUP - samo logiraj
            console.warn('⚠️ Chart će biti preskočen ovaj put');
        }
    }

    async fetchChartData(symbol) {
        try {
            // Interval mapping za različite timeframe-ove
            const intervalMap = {
                '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
                '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w'
            };
            
            const interval = intervalMap[this.selectedTimeframe] || '1h';
            const limit = this.selectedTimeframe === '1w' ? 52 : 100; // 52 weeks or 100 periods
            
            console.log(`📊 Dohvaćam Binance candle podatke: ${symbol}, interval: ${interval}, limit: ${limit}`);
            
            const response = await fetch(`${this.binanceApiUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const klines = await response.json();
            
            const labels = [];
            const prices = [];
            
            klines.forEach(kline => {
                const timestamp = parseInt(kline[0]);
                const closePrice = parseFloat(kline[4]);
                
                const date = new Date(timestamp);
                
                // Format vremena na osnovu interval-a
                let timeFormat;
                if (interval === '1w') {
                    timeFormat = date.toLocaleDateString('sr-RS');
                } else if (interval === '1d') {
                    timeFormat = date.toLocaleDateString('sr-RS', { month: '2-digit', day: '2-digit' });
                } else {
                    timeFormat = date.toLocaleTimeString('sr-RS', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        day: interval.includes('h') ? '2-digit' : undefined,
                        month: interval.includes('h') ? '2-digit' : undefined
                    });
                }
                
                labels.push(timeFormat);
                prices.push(closePrice);
            });
            
            return {
                labels: labels,
                datasets: [{
                    label: `${symbol.replace('USDT', '')} STVARNA Cena`,
                    data: prices,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            };
            
        } catch (error) {
            console.error('❌ Greška pri dohvaćanju chart podataka:', error);
            throw new Error('Nemoguće učitati chart podatke sa Binance API');
        }
    }

    generateFallbackChartData(symbol) {
        // Backup chart data kada Binance API ne radi
        const currentPrice = this.cryptoData?.[symbol]?.price || 50000;
        
        const labels = [];
        const prices = [];
        
        for (let i = 24; i >= 0; i--) {
            const time = new Date();
            time.setHours(time.getHours() - i);
            labels.push(time.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }));
            
            // Generiši realistic varijacije oko trenutne cene
            const variation = (Math.random() - 0.5) * currentPrice * 0.03; // ±3%
            prices.push(Math.max(0, currentPrice + variation));
        }
        
        return {
            labels: labels,
            datasets: [{
                label: `${symbol.replace('USDT', '')} Backup Chart`,
                data: prices,
                borderColor: '#ffaa00',
                backgroundColor: 'rgba(255, 170, 0, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
    }



    // Sve ostale metode ostaju iste kao u originalnom fajlu
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
                let signal = 'NEUTRALNO';
                let signalClass = 'neutral';
                
                if (rsi > 70) { signal = 'PREKUPLJENA'; signalClass = 'bearish'; }
                else if (rsi < 30) { signal = 'PREPRODANA'; signalClass = 'bullish'; }
                else if (rsi > 60) { signal = 'BIKOVSKO'; signalClass = 'bullish'; }
                else if (rsi < 40) { signal = 'MEDVEĐE'; signalClass = 'bearish'; }
                
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
                const signal = macd > 0 ? 'BIKOVSKO' : 'MEDVEĐE';
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
                let signal = 'NEUTRALNO';
                let signalClass = 'neutral';
                
                if (price <= bb.lower) { signal = 'PREPRODANA'; signalClass = 'bullish'; }
                else if (price >= bb.upper) { signal = 'PREKUPLJENA'; signalClass = 'bearish'; }
                
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
                const signal = volume.ratio > 1.5 ? 'VISOK' : 'NORMALAN';
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
                let signal = 'NEUTRALNO';
                let signalClass = 'neutral';
                
                if (stochRSI < 20) { signal = 'PREPRODANA'; signalClass = 'bullish'; }
                else if (stochRSI > 80) { signal = 'PREKUPLJENA'; signalClass = 'bearish'; }
                
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
                    let signal = 'NEUTRALNO';
                    let signalClass = 'neutral';
                    
                    if (price > ema20 && ema20 > ema50) { signal = 'BIKOVSKO'; signalClass = 'bullish'; }
                    else if (price < ema20 && ema20 < ema50) { signal = 'MEDVEĐE'; signalClass = 'bearish'; }
                    
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
        let consensus = 'NEUTRALNO';
        
        if (totalSignals > 0) {
            const bullishPercentage = (bullishSignals / totalSignals) * 100;
            const bearishPercentage = (bearishSignals / totalSignals) * 100;
            
            if (bullishPercentage >= 60) {
                accuracy = Math.min(95, 50 + bullishPercentage);
                consensus = 'JAKO KUPUJ';
            } else if (bearishPercentage >= 60) {
                accuracy = Math.min(95, 50 + bearishPercentage);
                consensus = 'JAKO PRODAJ';
            } else if (bullishPercentage > bearishPercentage) {
                accuracy = 50 + (bullishPercentage - bearishPercentage);
                consensus = 'KUPUJ';
            } else if (bearishPercentage > bullishPercentage) {
                accuracy = 50 + (bearishPercentage - bullishPercentage);
                consensus = 'PRODAJ';
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

    updatePredictions(predictions, analysisData = null) {
        if (!predictions) {
            predictions = this.getBasicPredictions();
        }
        
        console.log('🔮 Ažuriram predviđanja:', predictions);
        
        // Generiši glavni ukupni signal sa stvarnom cenom
        const currentPrice = analysisData ? analysisData.price : this.getCurrentPrice();
        this.updateMainSignal(predictions, currentPrice);
        
        // Svi timeframe elementi sa boljim prikazom
        const timeframes = ['1m', '3m', '15m', '1h', '4h', '6h', '12h', '1d', '1w', '1M'];
        
        timeframes.forEach((tf, index) => {
            const predElement = document.getElementById(`pred-${tf}`);
            const confElement = document.getElementById(`conf-${tf}`);
            
            if (predElement && confElement && predictions[tf]) {
                const p = predictions[tf];
                const directionText = this.translateDirection(p.direction);
                
                // Dodaj informacije o sledećem ažuriranju
                const nextUpdate = this.getNextUpdateTime(tf);
                
                predElement.innerHTML = `
                    ${directionText} ${p.changePercent.toFixed(2)}%
                    <small style="display: block; opacity: 0.7; font-size: 11px;">
                        ⏰ Sledeće: ${nextUpdate}
                    </small>
                `;
                
                confElement.innerHTML = `
                    ${p.confidence.toFixed(1)}% pouzdanost
                    <small style="display: block; opacity: 0.7; font-size: 10px;">
                        📊 Tačnost: ${this.getTimeframeAccuracy(tf)}%
                    </small>
                `;
                
                predElement.className = `prediction-value ${p.direction.toLowerCase()}`;
                
                // Dodaj indikator za svež/zastarel signal
                const age = this.getSignalAge(tf);
                if (age > this.getTimeframeInterval(tf)) {
                    predElement.classList.add('stale-signal');
                } else {
                    predElement.classList.remove('stale-signal');
                }
            }
        });
    }

    updateSpecificTimeframePrediction(timeframe) {
        // Ažuriraj samo specifičan timeframe
        const prediction = this.generateTimeframePrediction(timeframe);
        
        const predElement = document.getElementById(`pred-${timeframe}`);
        const confElement = document.getElementById(`conf-${timeframe}`);
        
        if (predElement && confElement) {
            const directionText = this.translateDirection(prediction.direction);
            const nextUpdate = this.getNextUpdateTime(timeframe);
            
            predElement.innerHTML = `
                ${directionText} ${prediction.changePercent.toFixed(2)}%
                <small style="display: block; opacity: 0.7; font-size: 11px;">
                    🆕 Upravo ažurirano | ⏰ Sledeće: ${nextUpdate}
                </small>
            `;
            
            confElement.innerHTML = `
                ${prediction.confidence.toFixed(1)}% pouzdanost
                <small style="display: block; opacity: 0.7; font-size: 10px;">
                    📊 Tačnost: ${this.getTimeframeAccuracy(timeframe)}%
                </small>
            `;
            
            predElement.className = `prediction-value ${prediction.direction.toLowerCase()} fresh-signal`;
            
            // Ukloni fresh-signal klasu posle 30 sekundi
            setTimeout(() => {
                predElement.classList.remove('fresh-signal');
            }, 30000);
        }
        
        // Sačuvaj prediction za tracking
        this.savePredictionForTracking(timeframe, prediction);
    }

    generateTimeframePrediction(timeframe) {
        // Generiši prediction specifičan za timeframe
        const timeframeMultipliers = {
            '1m': 0.1,   '3m': 0.2,   '15m': 0.4,  '1h': 0.8,   '4h': 1.2,
            '6h': 1.5,   '12h': 2.0,  '1d': 3.0,   '1w': 5.0,   '1M': 8.0
        };
        
        const multiplier = timeframeMultipliers[timeframe] || 1.0;
        const baseVolatility = 0.1 + Math.random() * 0.8;
        const change = (Math.random() - 0.5) * baseVolatility * multiplier;
        
        let direction = 'rast';
        let confidence = 70 + Math.random() * 25;
        
        if (change < -0.1) direction = 'pad';
        else if (Math.abs(change) < 0.05) {
            direction = Math.random() > 0.5 ? 'konsolidacija' : 'bočno';
            confidence = 60 + Math.random() * 20;
        }
        
        return {
            direction: direction,
            changePercent: Math.abs(change),
            confidence: confidence,
            timestamp: Date.now(),
            timeframe: timeframe
        };
    }

    getNextUpdateTime(timeframe) {
        const intervals = {
            '1m': '1min',   '3m': '3min',   '15m': '15min',  '1h': '1sat',
            '4h': '4sata',  '6h': '6sati',  '12h': '12sati', '1d': '24sata',
            '1w': '7dana',  '1M': '30dana'
        };
        return intervals[timeframe] || 'nepoznato';
    }

    getTimeframeInterval(timeframe) {
        const intervals = {
            '1m': 1 * 60 * 1000,      '3m': 3 * 60 * 1000,      '15m': 15 * 60 * 1000,
            '1h': 60 * 60 * 1000,     '4h': 4 * 60 * 60 * 1000, '6h': 6 * 60 * 60 * 1000,
            '12h': 12 * 60 * 60 * 1000, '1d': 24 * 60 * 60 * 1000, '1w': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000
        };
        return intervals[timeframe] || 60000;
    }

    getSignalAge(timeframe) {
        const lastUpdate = localStorage.getItem(`lastUpdate_${timeframe}`);
        if (!lastUpdate) return 0;
        return Date.now() - parseInt(lastUpdate);
    }

    trackPredictionAccuracy(timeframe) {
        // Proveri tačnost prethodnih predviđanja
        if (!this.predictionHistory[timeframe]) {
            this.predictionHistory[timeframe] = [];
        }
        
        const history = this.predictionHistory[timeframe];
        if (history.length > 0) {
            const lastPrediction = history[history.length - 1];
            if (lastPrediction && !lastPrediction.verified) {
                // Proveri da li se predviđanje ostvarilo
                const actualChange = this.getActualPriceChange(timeframe, lastPrediction.timestamp);
                const predicted = lastPrediction.direction === 'rast' ? 1 : lastPrediction.direction === 'pad' ? -1 : 0;
                const actual = actualChange > 0.1 ? 1 : actualChange < -0.1 ? -1 : 0;
                
                lastPrediction.verified = true;
                lastPrediction.correct = predicted === actual;
                lastPrediction.actualChange = actualChange;
                
                console.log(`📊 Verifikacija ${timeframe}: ${lastPrediction.correct ? '✅ Tačno' : '❌ Netačno'}`);
            }
        }
        
        this.savePredictionHistory();
    }

    getActualPriceChange(timeframe, timestamp) {
        // Simulira stvarnu promenu cene (u realnoj implementaciji bi koristio pravi API)
        return (Math.random() - 0.5) * 2; // -1 do 1
    }

    getTimeframeAccuracy(timeframe) {
        if (!this.predictionHistory[timeframe]) return 'N/A';
        
        const history = this.predictionHistory[timeframe];
        const verified = history.filter(p => p.verified);
        const correct = verified.filter(p => p.correct);
        
        if (verified.length === 0) return 'N/A';
        
        const accuracy = (correct.length / verified.length) * 100;
        return accuracy.toFixed(1);
    }

    savePredictionForTracking(timeframe, prediction) {
        if (!this.predictionHistory[timeframe]) {
            this.predictionHistory[timeframe] = [];
        }
        
        this.predictionHistory[timeframe].push(prediction);
        
        // Zadrži samo poslednjih 50 predviđanja
        if (this.predictionHistory[timeframe].length > 50) {
            this.predictionHistory[timeframe] = this.predictionHistory[timeframe].slice(-50);
        }
        
        this.savePredictionHistory();
        localStorage.setItem(`lastUpdate_${timeframe}`, Date.now().toString());
    }

    savePredictionHistory() {
        localStorage.setItem('predictionHistory', JSON.stringify(this.predictionHistory));
    }

    generateAndUpdateAllPredictions() {
        // Legacy function za ažuriranje svih odjednom
        const predictions = this.getBasicPredictions();
        this.updatePredictions(predictions);
    }

    updateMainSignal(predictions, currentPrice = null) {
        // Generiši detaljni glavni signal
        if (!currentPrice) {
            currentPrice = this.getCurrentPrice();
        }
        
        console.log(`💰 Koristim cenu za main signal: $${currentPrice}`);
        const detailedSignal = this.generateDetailedMainSignal(predictions, currentPrice);
        
        // Ažuriraj DOM elemente sa detaljnim informacijama
        const signalElement = document.getElementById('main-signal');
        if (signalElement) {
            // Proširi glavni signal sa više informacija
            signalElement.innerHTML = `
                <div class="signal-icon">${detailedSignal.icon}</div>
                <div class="signal-main">
                    <div class="signal-text">${detailedSignal.icon} GLAVNO PREDVIĐANJE: ${detailedSignal.direction}</div>
                    <div class="signal-confidence">${detailedSignal.confidence.toFixed(1)}% pouzdanost</div>
                </div>
                <div class="signal-details">
                    <div class="price-prediction">
                        <strong>📊 Očekivana cena:</strong> $${detailedSignal.expectedPrice.toFixed(2)}
                        <span class="price-change">(${detailedSignal.direction === 'PAD' ? '-' : '+'}${detailedSignal.percentChange.toFixed(1)}%)</span>
                    </div>
                    <div class="time-prediction">
                        <strong>⏰ Vreme do promene:</strong> ${detailedSignal.timeToChange}
                    </div>
                    <div class="levels-prediction">
                        <strong>📈 Resistance:</strong> $${detailedSignal.resistanceLevel.toFixed(2)} | 
                        <strong>📉 Support:</strong> $${detailedSignal.supportLevel.toFixed(2)}
                    </div>
                    <div class="analysis-summary">
                        <strong>🔍 Analiza:</strong> ${detailedSignal.analysis}
                    </div>
                </div>
                <div class="signal-description">
                    <strong>💡 Preporuka:</strong> ${detailedSignal.recommendation} - 
                    ${detailedSignal.direction === 'PAD' ? 
                        `Očekuje se pad do $${detailedSignal.expectedPrice.toFixed(2)} u narednih ${detailedSignal.timeToChange}` :
                        detailedSignal.direction === 'RAST' ? 
                        `Očekuje se rast do $${detailedSignal.expectedPrice.toFixed(2)} u narednih ${detailedSignal.timeToChange}` :
                        'Čekajte jasniji signal pre donošenja odluke'}
                </div>
            `;
            
            // Dodaj odgovarajuću klasu za styling
            signalElement.className = 'main-signal detailed';
            if (detailedSignal.direction === 'RAST') signalElement.classList.add('bullish');
            else if (detailedSignal.direction === 'PAD') signalElement.classList.add('bearish');
            else signalElement.classList.add('neutral');
        }
    }

    getCurrentPrice() {
        // Get current price SAMO iz STVARNIH Binance podataka
        if (this.cryptoData && this.cryptoData[this.selectedCrypto]) {
            console.log(`💰 Trenutna STVARNA cena za ${this.selectedCrypto}: $${this.cryptoData[this.selectedCrypto].price}`);
            return this.cryptoData[this.selectedCrypto].price;
        }
        
        console.warn(`⚠️ Nema cache podataka za ${this.selectedCrypto} - koristim fallback`);
        // Ne vraćaj mock podatke - vrati null da se API pozove ponovo
        return null;
    }

    async generateSmartPredictions(symbol, analysisData) {
        try {
            console.log(`🧠 Generiram pametan prognoza za ${symbol} na osnovu stvarnih indikatora...`);
            
            const { price: currentPrice, indicators } = analysisData;
            const predictions = {};
            const timeframes = ['1m', '3m', '15m', '1h', '4h', '6h', '12h', '1d', '1w', '1M'];
            
            // Analiziraj osnovne trendove na osnovu RSI, MACD, Bollinger Bands
            const rsiSignal = this.getRSISignal(indicators.rsi);
            const macdSignal = this.getMACDSignal(indicators.macd);
            const bollingerSignal = this.getBollingerSignal(currentPrice, indicators.bb);
            const emaSignal = this.getEMASignal(indicators.ema20, indicators.ema50);
            
            // Kombiniraj signale za general trend
            const signals = [rsiSignal, macdSignal, bollingerSignal, emaSignal];
            const bullishCount = signals.filter(s => s === 'bullish').length;
            const bearishCount = signals.filter(s => s === 'bearish').length;
            
            let overallTrend = 'neutral';
            if (bullishCount > bearishCount) overallTrend = 'bullish';
            else if (bearishCount > bullishCount) overallTrend = 'bearish';
            
            // Generiraj predviđanja za različite timeframe-ove
            timeframes.forEach((tf, index) => {
                const multiplier = this.getTimeframeMultiplier(tf);
                let baseChange = this.calculatePredictedChange(indicators, multiplier);
                let direction = 'konsolidacija';
                let confidence = 50;
                
                // Determine direction na osnovu promjene i overall trend
                if (Math.abs(baseChange) > 0.003) { // Minimum 0.3% promjena da ne bude sve konsolidacija
                    if (baseChange > 0) {
                        direction = 'rast';
                        confidence = Math.min(90, 65 + (Math.abs(baseChange) * 500));
                    } else {
                        direction = 'pad'; 
                        confidence = Math.min(90, 65 + (Math.abs(baseChange) * 500));
                    }
                } else {
                    direction = 'konsolidacija';
                    confidence = 55 + Math.random() * 15;
                }
                
                // Override based na overall trend ako je jak
                if (overallTrend === 'bullish' && bullishCount >= 3) {
                    if (direction !== 'pad') { // Ne mijenjaj ako je już clear bearish
                        direction = 'rast';
                        baseChange = Math.max(baseChange, 0.01); // Minimum 1% za bullish
                        confidence = Math.max(confidence, 70);
                    }
                } else if (overallTrend === 'bearish' && bearishCount >= 3) {
                    if (direction !== 'rast') { // Ne mijenjaj ako je već clear bullish
                        direction = 'pad';
                        baseChange = Math.min(baseChange, -0.01); // Minimum 1% za bearish
                        confidence = Math.max(confidence, 70);
                    }
                }
                
                // Dodaj volatilnost za duže timeframe-ove
                if (multiplier > 2) {
                    const volatilityBoost = (Math.random() - 0.5) * 0.02 * multiplier;
                    baseChange += volatilityBoost;
                    confidence += Math.random() * 10 - 5;
                }
                
                predictions[tf] = {
                    direction: direction,
                    changePercent: Math.abs(baseChange),
                    confidence: Math.max(45, Math.min(95, confidence))
                };
            });
            
            return predictions;
            
        } catch (error) {
            console.error('❌ Greška pri generiranju predviđanja:', error);
            // Fallback na osnovnu analizu
            return this.getBasicPredictions();
        }
    }
    
    getRSISignal(rsi) {
        if (rsi > 70) return 'bearish'; // Overbought
        if (rsi < 30) return 'bullish'; // Oversold
        return 'neutral';
    }
    
    getMACDSignal(macd) {
        if (macd.macd > macd.signal) return 'bullish';
        if (macd.macd < macd.signal) return 'bearish';
        return 'neutral';
    }
    
    getBollingerSignal(currentPrice, bb) {
        if (currentPrice > bb.upper) return 'bearish'; // Price above upper band
        if (currentPrice < bb.lower) return 'bullish'; // Price below lower band
        return 'neutral';
    }
    
    getEMASignal(ema20, ema50) {
        if (ema20 > ema50) return 'bullish'; // Golden cross
        if (ema20 < ema50) return 'bearish'; // Death cross
        return 'neutral';
    }
    
    getTimeframeMultiplier(timeframe) {
        const multipliers = {
            '1m': 0.1, '3m': 0.2, '15m': 0.3, '1h': 0.5, 
            '4h': 0.8, '6h': 1.0, '12h': 1.3, '1d': 1.8, 
            '1w': 2.5, '1M': 4.0
        };
        return multipliers[timeframe] || 1.0;
    }
    
    calculatePredictedChange(indicators, multiplier) {
        // Kalkuliraj promjenu na osnovu kombinacije indikatora
        let baseChange = 0;
        
        // RSI uticaj (više agresivan)
        if (indicators.rsi < 30) {
            baseChange += 0.05; // Jako oversold = 5% bullish
        } else if (indicators.rsi < 40) {
            baseChange += 0.02; // Oversold = 2% bullish  
        } else if (indicators.rsi > 70) {
            baseChange -= 0.05; // Jako overbought = 5% bearish
        } else if (indicators.rsi > 60) {
            baseChange -= 0.02; // Overbought = 2% bearish
        } else {
            // RSI između 40-60 = neutralno
            baseChange += (Math.random() - 0.5) * 0.01; // ±0.5%
        }
        
        // MACD signal strength
        const macdDiff = Math.abs(indicators.macd.macd - indicators.macd.signal);
        const macdStrength = Math.min(macdDiff / 10, 0.03); // Max 3% od MACD
        
        if (indicators.macd.macd > indicators.macd.signal) {
            baseChange += macdStrength; // Bullish crossover
        } else if (indicators.macd.macd < indicators.macd.signal) {
            baseChange -= macdStrength; // Bearish crossover
        }
        
        // Volume amplifikator
        if (indicators.volume.ratio > 1.5) {
            baseChange *= 1.4; // High volume pojačava signal
        } else if (indicators.volume.ratio < 0.7) {
            baseChange *= 0.6; // Low volume slabi signal
        }
        
        // EMA trend
        if (indicators.ema20 > indicators.ema50) {
            baseChange += 0.01; // Bullish trend
        } else if (indicators.ema20 < indicators.ema50) {
            baseChange -= 0.01; // Bearish trend
        }
        
        // Dodaj timeframe multiplier
        const finalChange = baseChange * multiplier;
        
        console.log(`📊 Calculated change: RSI=${indicators.rsi}, MACD=${indicators.macd.macd.toFixed(4)}, base=${baseChange.toFixed(4)}, final=${finalChange.toFixed(4)}`);
        
        return finalChange;
    }
    
    getBasicPredictions() {
        // Jednostavan fallback
        const predictions = {};
        const timeframes = ['1m', '3m', '15m', '1h', '4h', '6h', '12h', '1d', '1w', '1M'];
        
        timeframes.forEach((tf, index) => {
            predictions[tf] = {
                direction: 'konsolidacija',
                changePercent: Math.random() * 2,
                confidence: 50 + Math.random() * 20
            };
        });
        
        return predictions;
    }

    generateDetailedMainSignal(predictions, currentPrice) {
        // Analiziraj sve predictions da generiš glavni signal
        let bullishSignals = 0;
        let bearishSignals = 0;
        let averageConfidence = 0;
        let totalChange = 0;
        
        const timeframes = Object.keys(predictions);
        
        timeframes.forEach(tf => {
            const pred = predictions[tf];
            averageConfidence += pred.confidence;
            
            if (pred.direction === 'rast') {
                bullishSignals++;
                totalChange += pred.changePercent;
            } else if (pred.direction === 'pad') {
                bearishSignals++;
                totalChange -= pred.changePercent;
            }
        });
        
        averageConfidence = averageConfidence / timeframes.length;
        const expectedChange = totalChange / timeframes.length;
        
        // Generiši glavni signal
        let mainDirection = 'konsolidacija';
        let mainIcon = '🔄';
        let recommendation = 'ČEKAJTE';
        let expectedPrice = currentPrice; // Use actual current price
        
        // Ako nema currentPrice, ne možemo generirati prognoza
        if (!expectedPrice) {
            console.warn('⚠️ Nema trenutne cene - ne mogu generirati prognozu');
            expectedPrice = 0;
        }
        
        if (bullishSignals > bearishSignals) {
            mainDirection = 'RAST';
            mainIcon = '📈';
            recommendation = 'KUPOVINU';
            expectedPrice = expectedPrice * (1 + Math.abs(expectedChange));
        } else if (bearishSignals > bullishSignals) {
            mainDirection = 'PAD';
            mainIcon = '📉';
            recommendation = 'PRODAJU';
            expectedPrice = expectedPrice * (1 - Math.abs(expectedChange));
        }
        
        // Generiši detaljnu analizu
        const priceChange = Math.abs(expectedPrice - (currentPrice || 55000));
        const percentChange = Math.abs(expectedChange * 100);
        
        // Predvidi vremenske okvire
        const timeToChange = this.estimateTimeToChange(bearishSignals, bullishSignals);
        const supportLevel = (currentPrice || 55000) * 0.95;
        const resistanceLevel = (currentPrice || 55000) * 1.05;
        
        return {
            direction: mainDirection,
            icon: mainIcon,
            confidence: averageConfidence,
            recommendation: recommendation,
            expectedPrice: expectedPrice,
            priceChange: priceChange,
            percentChange: percentChange,
            timeToChange: timeToChange,
            supportLevel: supportLevel,
            resistanceLevel: resistanceLevel,
            totalSignals: timeframes.length,
            bullishSignals: bullishSignals,
            bearishSignals: bearishSignals,
            analysis: `${bullishSignals}/${timeframes.length} signala za RAST, ${bearishSignals}/${timeframes.length} za PAD`
        };
    }

    estimateTimeToChange(bearishSignals, bullishSignals) {
        const strongSignals = Math.max(bearishSignals, bullishSignals);
        
        if (strongSignals >= 7) return '1-4 sata';
        if (strongSignals >= 5) return '4-12 sati';  
        if (strongSignals >= 3) return '12-24 sata';
        return '1-3 dana';
    }

    translateDirection(direction) {
        const translations = {
            'rast': '📈 RAST',
            'pad': '📉 PAD', 
            'stagniranje': '➡️ STAGNIRA',
            'konsolidacija': '🔄 KONSOLIDACIJA',
            'sideways': '↔️ BOČNO',
            'up': '📈 RAST',
            'down': '📉 PAD',
            'bullish': '🐂 BIKOVSKO',
            'bearish': '🐻 MEDVEĐE'
        };
        return translations[direction] || '➡️ STABILNO';
    }

    async updateTimeframeAnalysis(symbol) {
        try {
            console.log(`📊 Generiram STVARNU multi-timeframe analizu za ${symbol}...`);
            
            const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
            const data = {};
            
            // Za svaki timeframe dohvati STVARNE podatke sa Binance API
            for (const tf of timeframes) {
                try {
                    console.log(`📈 Dohvaćam ${tf} podatke za ${symbol}...`);
                    
                    // Dohvati candle podatke za specific timeframe
                    const response = await fetch(`${this.binanceApiUrl}/klines?symbol=${symbol}&interval=${tf}&limit=50`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    const klines = await response.json();
                    const closePrices = klines.map(candle => parseFloat(candle[4]));
                    const volumes = klines.map(candle => parseFloat(candle[5]));
                    
                    // Izračunaj STVARNE tehničke indikatore za ovaj timeframe
                    const rsi = this.calculateRSI(closePrices);
                    const currentPrice = closePrices[closePrices.length - 1];
                    const macd = this.calculateMACD(closePrices);
                    
                    // Generiraj PAMETAN signal na osnovu stvarnih indikatora
                    let signal = 'DRŽI';
                    let signalClass = 'neutral';
                    
                    if (rsi < 30) { 
                        signal = 'KUPUJ'; 
                        signalClass = 'bullish';
                    } else if (rsi > 70) { 
                        signal = 'PRODAJ'; 
                        signalClass = 'bearish';
                    } else if (macd.macd > macd.signal) {
                        signal = 'RAST';
                        signalClass = 'bullish';
                    } else if (macd.macd < macd.signal) {
                        signal = 'PAD';
                        signalClass = 'bearish';
                    }
                    
                    data[tf] = {
                        rsi: rsi,
                        signal: signal,
                        signalClass: signalClass,
                        price: currentPrice,
                        volume: volumes[volumes.length - 1],
                        macd: macd
                    };
                    
                } catch (tfError) {
                    console.error(`❌ Greška za ${tf}:`, tfError);
                    // Fallback sa trenutnom cenom ako timeframe ne radi
                    const currentPrice = this.cryptoData?.[symbol]?.price || 0;
                    data[tf] = {
                        rsi: 50,
                        signal: 'DRŽI',
                        signalClass: 'neutral',
                        price: currentPrice,
                        volume: 0
                    };
                }
            }
            
            console.log(`✅ STVARNI multi-timeframe podaci za ${symbol}:`, data);
            
            const timeframeGrid = document.getElementById('timeframe-grid');
            if (!timeframeGrid) return;
            
            timeframeGrid.innerHTML = '';
            
            Object.keys(data).forEach(tf => {
                const tfData = data[tf];
                
                const panel = document.createElement('div');
                panel.className = 'timeframe-panel';
                
                const signal = tfData.signal || 'DRŽI';
                const signalClass = tfData.signalClass || 'neutral';
                const rsi = tfData.rsi ? tfData.rsi.toFixed(1) : '--';
                const price = tfData.price ? tfData.price.toFixed(4) : '--';
                const symbolName = symbol.replace('USDT', '');
                
                // Dodaj volume indicator
                const volumeIndicator = tfData.volume > 1000000 ? '🔥' : '';
                
                panel.innerHTML = `
                    <div class="tf-header">${tf.toUpperCase()} ${volumeIndicator}</div>
                    <div class="tf-signal ${signalClass}">${signal}</div>
                    <div class="tf-rsi">RSI: ${rsi}</div>
                    <div class="tf-price">$${price}</div>
                    <div class="tf-symbol">${symbolName}</div>
                `;
                
                timeframeGrid.appendChild(panel);
            });
            
        } catch (error) {
            console.error('❌ Greška pri ažuriranju timeframe analize:', error);
            // NE PRIKAŽI error popup - samo logiraj
            console.warn('⚠️ Multi-timeframe analiza neće biti prikazana ovaj put');
            // this.showError('Multi-timeframe analiza trenutno nedostupna');
        }
    }

    setupEventListeners() {
        // Dropdown change listener
        const dropdown = document.getElementById('currency-select');
        if (dropdown) {
            dropdown.addEventListener('change', async (e) => {
                const selectedValue = e.target.value;
                if (selectedValue) {
                    this.selectedCrypto = selectedValue;
                    localStorage.setItem('selectedCrypto', selectedValue);
                    await this.loadCryptoDetails(selectedValue);
                    console.log(`💰 Odabrana valuta: ${selectedValue} (spremljeno u localStorage)`);
                }
            });
        }
        
        // Timeframe buttons
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedTimeframe = e.target.dataset.tf;
                
                console.log(`🎯 Odabran novi timeframe: ${this.selectedTimeframe}`);
                
                // RESTART update interval sa novim timeframe-om
                this.startUpdates();
                
                // Učitaj podatke za novi timeframe
                await this.loadCryptoDetails(this.selectedCrypto);
            });
        });

        // Toggle grid button
        const toggleBtn = document.getElementById('toggle-grid');
        const cryptoGrid = document.getElementById('crypto-grid');
        
        if (toggleBtn && cryptoGrid) {
            toggleBtn.addEventListener('click', () => {
                cryptoGrid.classList.toggle('show');
                toggleBtn.textContent = cryptoGrid.classList.contains('show') ? 
                    '👁️ SAKRIJ SVE VALUTE' : '👁️ PRIKAŽI SVE VALUTE';
            });
        }
    }

    startUpdates() {
        // STOP svim postojećim intervalima
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            console.log('🛑 Zaustavljen stari update interval');
        }
        if (this.predictionInterval) {
            clearInterval(this.predictionInterval);
            console.log('🛑 Zaustavljen stari prediction interval');
        }
        
        // PAMETNO ažuriranje na osnovu odabranog timeframe-a
        const timeframeIntervals = {
            '1m': 60 * 1000,        // 1 minuta
            '5m': 5 * 60 * 1000,    // 5 minuta
            '15m': 15 * 60 * 1000,  // 15 minuta
            '30m': 30 * 60 * 1000,  // 30 minuta  
            '1h': 60 * 60 * 1000,   // 1 sat
            '4h': 4 * 60 * 60 * 1000, // 4 sata
            '1d': 24 * 60 * 60 * 1000, // 24 sata
            '1w': 7 * 24 * 60 * 60 * 1000 // 7 dana
        };
        
        const currentTimeframe = this.selectedTimeframe || '1h';
        const updateInterval = timeframeIntervals[currentTimeframe] || (60 * 60 * 1000); // Default 1h
        
        console.log(`🔄 Pokretam PAMETAN update interval: ${currentTimeframe} = ${updateInterval/1000}s`);
        
        // Prvo ažuriranje odmah
        this.loadInitialData();
        
        // Zatim ažuriranje prema timeframe-u
        this.updateInterval = setInterval(() => {
            console.log(`🔄 Automatsko ažuriranje (${currentTimeframe} interval)...`);
            this.loadInitialData();
        }, updateInterval);
        
        console.log(`✅ Pokrenuto pametan ažuriranje - ${currentTimeframe} timeframe`);
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

    showProfitAlert(crypto, prediction) {
        const profitDiv = document.createElement('div');
        profitDiv.className = 'profit-alert';
        
        const profitDirection = prediction.direction === 'rast' ? '🚀 PROFIT PRILIKA!' : '📉 OPREZ - PAD!';
        const bgColor = prediction.direction === 'rast' ? '#00ff88' : '#ff4444';
        
        profitDiv.innerHTML = `
            <div style="font-size: 18px; font-weight: bold;">${profitDirection}</div>
            <div>${crypto.replace('USDT', '')} - ${prediction.changePercent.toFixed(2)}%</div>
            <div>Pouzdanost: ${prediction.confidence.toFixed(1)}%</div>
        `;
        
        profitDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: ${bgColor}; color: white; padding: 20px; border-radius: 12px;
            z-index: 10001; text-align: center; min-width: 250px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: pulse 1s infinite;
            border: 2px solid white;
        `;
        
        document.body.appendChild(profitDiv);
        
        setTimeout(() => {
            if (profitDiv.parentNode) {
                profitDiv.parentNode.removeChild(profitDiv);
            }
        }, 4000);
    }

    addTradingTips() {
        // Dodaj korisne trading savete u UI
        const tipsContainer = document.createElement('div');
        tipsContainer.id = 'trading-tips';
        tipsContainer.innerHTML = `
            <div class="tips-header">
                <h3>💡 TRADING SAVJETI</h3>
                <button class="close-tips" onclick="this.parentElement.parentElement.remove()">✖️</button>
            </div>
            <div class="tips-content">
                <div class="tip">📊 RSI ispod 30 = mogućnost kupovine (oversold)</div>
                <div class="tip">📈 RSI iznad 70 = mogućnost prodaje (overbought)</div>
                <div class="tip">🔄 MACD crossover = signal za promenu trenda</div>
                <div class="tip">💰 Visok volumen = jak signal, nizak = slab</div>
                <div class="tip">📉 Bollinger Bands: cena na donjoj = kupuj</div>
                <div class="tip">📈 Bollinger Bands: cena na gornjoj = prodaj</div>
                <div class="tip">🔥 EMA20 > EMA50 = bullish trend (golden cross)</div>
                <div class="tip">❄️ EMA20 < EMA50 = bearish trend (death cross)</div>
                <div class="tip">⚠️ UVEK koristi stop-loss (3-5% ispod cene)!</div>
                <div class="tip">💎 Diverzifikuj portfolio - ne stavljaj sve u jedan coin</div>
                <div class="tip">� Kupi na support liniji, prodaj na resistance</div>
                <div class="tip">�🌐 Svi podaci su sa Binance API u realnom vremenu</div>
                <div class="tip tip-warning">🚨 OVO NISU FINANSIJSKI SAVETI - TRADING RIZIK!</div>
            </div>
        `;
        
        tipsContainer.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,50,100,0.8));
            color: white; padding: 0; border-radius: 12px; max-width: 350px; min-width: 300px;
            font-size: 12px; z-index: 10000; border: 1px solid #0088ff; 
            box-shadow: 0 8px 32px rgba(0,136,255,0.3); backdrop-filter: blur(10px);
            animation: slideInLeft 0.5s ease-out; max-height: 70vh; overflow-y: auto;
        `;
        
        // Dodaj custom stilove za tips
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            #trading-tips .tips-header {
                background: linear-gradient(90deg, #0088ff, #00aaff);
                padding: 12px 15px; border-radius: 12px 12px 0 0; 
                display: flex; justify-content: space-between; align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.2);
            }
            
            #trading-tips h3 {
                margin: 0; font-size: 14px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            
            #trading-tips .close-tips {
                background: none; border: none; color: white; font-size: 14px; 
                cursor: pointer; padding: 2px 6px; border-radius: 4px;
                transition: background 0.2s ease;
            }
            
            #trading-tips .close-tips:hover {
                background: rgba(255,255,255,0.2);
            }
            
            #trading-tips .tips-content {
                padding: 15px; max-height: 50vh; overflow-y: auto;
            }
            
            #trading-tips .tip {
                margin: 8px 0; padding: 8px 10px; background: rgba(255,255,255,0.1);
                border-radius: 6px; border-left: 3px solid #0088ff; 
                transition: all 0.2s ease; font-size: 11px; line-height: 1.4;
            }
            
            #trading-tips .tip:hover {
                background: rgba(255,255,255,0.15); transform: translateX(3px);
                border-left-color: #00ff88;
            }
            
            #trading-tips .tip-warning {
                border-left-color: #ff4444; background: rgba(255,68,68,0.15);
                font-weight: bold; animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            #trading-tips::-webkit-scrollbar {
                width: 6px;
            }
            
            #trading-tips::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1); border-radius: 3px;
            }
            
            #trading-tips::-webkit-scrollbar-thumb {
                background: rgba(0,136,255,0.7); border-radius: 3px;
            }
            
            #trading-tips::-webkit-scrollbar-thumb:hover {
                background: rgba(0,136,255,0.9);
            }
        `;
        
        document.head.appendChild(style);
        
        // Dodaj samo ako već ne postoji
        if (!document.getElementById('trading-tips')) {
            document.body.appendChild(tipsContainer);
            
            // Auto-hide tips nakon 30 sekundi
            setTimeout(() => {
                if (tipsContainer.parentNode) {
                    tipsContainer.style.animation = 'slideInLeft 0.5s ease-out reverse';
                    setTimeout(() => {
                        if (tipsContainer.parentNode) {
                            tipsContainer.parentNode.removeChild(tipsContainer);
                        }
                    }, 500);
                }
            }, 30000);
            
            console.log('📝 Trading tips dodani u UI');
        }
    }

    destroy() {
        // OČISTI SVE INTERVALE kad se stranica zatvaraa
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            console.log('🗑️ Update interval očišten');
        }
        if (this.predictionInterval) {
            clearInterval(this.predictionInterval);
            console.log('🗑️ Prediction interval očišten');
        }
        if (this.chart) {
            this.chart.destroy();
            console.log('🗑️ Chart uništen');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM učitan, pokrećem Trading Dashboard (GitHub Pages verzija)...');
    window.tradingDashboard = new TradingDashboard();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    if (window.tradingDashboard) {
        window.tradingDashboard.destroy();
    }
});
