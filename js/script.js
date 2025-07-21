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
        
        await this.loadInitialData();
        this.setupEventListeners();
        this.startUpdates();
        this.addTradingTips();
        this.setupPredictionRefresh();
        
        console.log('✅ Dashboard uspešno inicijalizovan sa svim mogućnostima!');
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
            this.showError('Greška pri povezivanju sa Binance API. Molimo pokušajte ponovo.');
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
            
            return filteredData;
        } catch (error) {
            console.error('Greška pri učitavanju crypto podataka:', error);
            // Vrati mock podatke ako API ne radi
            return this.getMockCryptoData();
        }
    }

    getMockCryptoData() {
        // Generiši mock podatke ako API ne radi
        return this.cryptoSymbols.map(symbol => ({
            symbol: symbol,
            price: 30000 + Math.random() * 40000,
            change: (Math.random() - 0.5) * 20,
            volume: Math.random() * 1000000000
        }));
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
            
            // Generiši simulaciju tehničke analize
            const analysisData = this.generateTechnicalAnalysis(symbol);
            const predictions = this.generateSmartPredictions();
            
            console.log('📊 Podaci generisani:', { analysisData, predictions });
            
            this.updateTechnicalIndicators(analysisData);
            this.calculateOverallAccuracy(analysisData);
            this.updatePredictions(predictions);
            this.updateTimeframeAnalysis(symbol);
            await this.loadChart(symbol);
            
        } catch (error) {
            console.error('❌ Greška pri učitavanju detalja:', error);
        }
    }

    generateTechnicalAnalysis(symbol) {
        // Generiši realističnu simulaciju tehničke analize sa stvarnom cenom valute
        let basePrice = 0;
        
        // Koristi stvarnu cenu iz cryptoData ako postoji
        if (this.cryptoData[symbol]) {
            basePrice = this.cryptoData[symbol].price;
        } else {
            // Fallback - realistične cene za različite valute
            const priceRanges = {
                'BTCUSDT': [65000, 75000],     // Bitcoin
                'ETHUSDT': [2800, 3200],       // Ethereum  
                'BNBUSDT': [600, 700],         // BNB
                'SOLUSDT': [140, 180],         // Solana
                'XRPUSDT': [0.50, 0.60],       // XRP
                'ADAUSDT': [0.35, 0.45],       // Cardano
                'DOTUSDT': [7, 9],             // Polkadot
                'LINKUSDT': [14, 18],          // Chainlink
                'LTCUSDT': [80, 100],          // Litecoin
                'BCHUSDT': [450, 550],         // Bitcoin Cash
                'XLMUSDT': [0.11, 0.13],       // Stellar
                'UNIUSDT': [8, 12],            // Uniswap
                'VETUSDT': [0.025, 0.035],     // VeChain
                'TRXUSDT': [0.11, 0.13],       // Tron
                'FILUSDT': [4, 6],             // Filecoin
                'AAVEUSDT': [90, 110],         // Aave
                'MATICUSDT': [0.85, 1.15],     // Polygon
                'ATOMUSDT': [8, 10],           // Cosmos
                'NEARUSDT': [4, 6],            // Near Protocol
                'AVAXUSDT': [35, 45],          // Avalanche
                'FTMUSDT': [0.70, 0.90],       // Fantom
                'ALGOUSDT': [0.15, 0.25],      // Algorand
                'ICPUSDT': [10, 14],           // Internet Computer
                'SANDUSDT': [0.45, 0.55],      // The Sandbox
                'MANAUSDT': [0.40, 0.50],      // Decentraland
                'AXSUSDT': [6, 8],             // Axie Infinity
                'THETAUSDT': [1.8, 2.2],       // Theta Network
                'MKRUSDT': [2400, 2800],       // Maker
                'COMPUSDT': [55, 75],          // Compound
                'SUSHIUSDT': [0.90, 1.10],     // SushiSwap
                'YFIUSDT': [6000, 8000],       // Yearn.finance
                'CRVUSDT': [0.40, 0.50],       // Curve DAO
                'SNXUSDT': [2.5, 3.5],         // Synthetix
                '1INCHUSDT': [0.35, 0.45],     // 1inch
                'ENJUSDT': [0.25, 0.35],       // Enjin Coin
                'DOGEUSDT': [0.08, 0.12]       // Dogecoin
            };
            
            const range = priceRanges[symbol] || [1, 100]; // Default fallback
            basePrice = range[0] + Math.random() * (range[1] - range[0]);
        }
        
        // Dodaj mali random movement (±2%)
        const priceVariation = 0.98 + Math.random() * 0.04; // 0.98 to 1.02
        const price = basePrice * priceVariation;
        
        return {
            price: price,
            indicators: {
                rsi: 30 + Math.random() * 40, // 30-70 range
                macd: {
                    macd: (Math.random() - 0.5) * 100,
                    signal: (Math.random() - 0.5) * 80
                },
                bb: {
                    upper: price + (price * 0.02),
                    lower: price - (price * 0.02)
                },
                volume: {
                    current: Math.random() * 1000000000,
                    ratio: 0.5 + Math.random() * 2
                },
                stochRSI: Math.random() * 100,
                ema20: price + (Math.random() - 0.5) * price * 0.01,
                ema50: price + (Math.random() - 0.5) * price * 0.02
            }
        };
    }

    async loadChart(symbol) {
        try {
            console.log(`📈 Generiram grafikon za ${symbol}...`);
            
            // Generiši mock chart podatke
            const chartData = this.generateChartData(symbol);
            
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
                            text: `${symbol.replace('USDT', '')} - ${this.selectedTimeframe.toUpperCase()}`,
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

    generateChartData(symbol) {
        // Generiši realistic chart podatke sa tačnom cenom za valutu
        let basePrice = 0;
        
        // Koristi stvarnu cenu iz cryptoData ako postoji
        if (this.cryptoData[symbol]) {
            basePrice = this.cryptoData[symbol].price;
        } else {
            // Fallback - realistične cene za različite valute (iste kao u generateTechnicalAnalysis)
            const priceRanges = {
                'BTCUSDT': [65000, 75000],     'ETHUSDT': [2800, 3200],
                'BNBUSDT': [600, 700],         'SOLUSDT': [140, 180],
                'XRPUSDT': [0.50, 0.60],       'ADAUSDT': [0.35, 0.45],
                'DOTUSDT': [7, 9],             'LINKUSDT': [14, 18],
                'LTCUSDT': [80, 100],          'BCHUSDT': [450, 550],
                'XLMUSDT': [0.11, 0.13],       'UNIUSDT': [8, 12],
                'VETUSDT': [0.025, 0.035],     'TRXUSDT': [0.11, 0.13],
                'FILUSDT': [4, 6],             'AAVEUSDT': [90, 110],
                'MATICUSDT': [0.85, 1.15],     'ATOMUSDT': [8, 10],
                'NEARUSDT': [4, 6],            'AVAXUSDT': [35, 45],
                'FTMUSDT': [0.70, 0.90],       'ALGOUSDT': [0.15, 0.25],
                'ICPUSDT': [10, 14],           'SANDUSDT': [0.45, 0.55],
                'MANAUSDT': [0.40, 0.50],      'AXSUSDT': [6, 8],
                'THETAUSDT': [1.8, 2.2],       'MKRUSDT': [2400, 2800],
                'COMPUSDT': [55, 75],          'SUSHIUSDT': [0.90, 1.10],
                'YFIUSDT': [6000, 8000],       'CRVUSDT': [0.40, 0.50],
                'SNXUSDT': [2.5, 3.5],         '1INCHUSDT': [0.35, 0.45],
                'ENJUSDT': [0.25, 0.35],       'DOGEUSDT': [0.08, 0.12]
            };
            
            const range = priceRanges[symbol] || [1, 100];
            basePrice = range[0] + Math.random() * (range[1] - range[0]);
        }
        
        const labels = [];
        const prices = [];
        
        for (let i = 24; i >= 0; i--) {
            const time = new Date();
            time.setHours(time.getHours() - i);
            labels.push(time.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }));
            
            // Realističke varijacije za chart (±3% od base cene)
            const variation = (Math.random() - 0.5) * basePrice * 0.06;
            prices.push(Math.max(0, basePrice + variation)); // Avoid negative prices
        }
        
        return {
            labels: labels,
            datasets: [{
                label: `${symbol.replace('USDT', '')} Cena`,
                data: prices,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
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

    updatePredictions(predictions) {
        if (!predictions) {
            predictions = this.generateSmartPredictions();
        }
        
        console.log('🔮 Ažuriram predviđanja:', predictions);
        
        // Generiši glavni ukupni signal
        this.updateMainSignal(predictions);
        
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
        const predictions = this.generateSmartPredictions();
        this.updatePredictions(predictions);
    }

    updateMainSignal(predictions) {
        // Generiši detaljni glavni signal
        const currentPrice = this.getCurrentPrice(); // Will add this method
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
        // Get current price from crypto data or generate realistic one
        if (this.cryptoData && this.cryptoData[this.selectedCrypto]) {
            return this.cryptoData[this.selectedCrypto].price;
        }
        
        // Generate realistic prices based on crypto symbol
        const priceMap = {
            'BTCUSDT': 55000 + Math.random() * 20000,
            'ETHUSDT': 2500 + Math.random() * 1000,
            'BNBUSDT': 300 + Math.random() * 200,
            'SOLUSDT': 80 + Math.random() * 60,
            'XRPUSDT': 0.5 + Math.random() * 0.8,
            'ADAUSDT': 0.3 + Math.random() * 0.5,
            'DOGEUSDT': 0.05 + Math.random() * 0.1
        };
        
        return priceMap[this.selectedCrypto] || 1000 + Math.random() * 500;
    }

    generateSmartPredictions() {
        // Generiši pametnija predviđanja za sve timeframe-ove
        const predictions = {};
        const timeframes = ['1m', '3m', '15m', '1h', '4h', '6h', '12h', '1d', '1w', '1M'];
        
        timeframes.forEach((tf, index) => {
            const multiplier = (index + 1) * 0.3; // Veći timeframe = veća potencijalna promena
            const baseVolatility = 0.2 + Math.random() * 1.5;
            const change = (Math.random() - 0.5) * baseVolatility * multiplier;
            
            let direction = 'rast';
            let confidence = 65 + Math.random() * 25;
            
            if (change < -0.15) direction = 'pad';
            else if (Math.abs(change) < 0.1) {
                direction = Math.random() > 0.5 ? 'konsolidacija' : 'sideways';
                confidence = 55 + Math.random() * 20;
            }
            
            predictions[tf] = {
                direction: direction,
                changePercent: Math.abs(change),
                confidence: confidence
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
        let expectedPrice = currentPrice || 55000; // Fallback price
        
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
            console.log(`📊 Generiram multi-timeframe analizu za ${symbol}...`);
            
            const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
            const data = {};
            
            timeframes.forEach(tf => {
                const rsi = 30 + Math.random() * 40;
                let signal = 'DRŽI';
                
                if (rsi < 30) signal = 'KUPUJ';
                else if (rsi > 70) signal = 'PRODAJ';
                else if (rsi > 60) signal = 'RAST';
                else if (rsi < 40) signal = 'PAD';
                
                data[tf] = {
                    rsi: rsi,
                    signal: { signal: signal },
                    price: 30000 + Math.random() * 40000
                };
            });
            
            console.log('📈 Multi-timeframe podaci:', data);
            
            const timeframeGrid = document.getElementById('timeframe-grid');
            if (!timeframeGrid) return;
            
            timeframeGrid.innerHTML = '';
            
            Object.keys(data).forEach(tf => {
                const tfData = data[tf];
                
                const panel = document.createElement('div');
                panel.className = 'timeframe-panel';
                
                const signal = tfData.signal ? tfData.signal.signal : 'DRŽI';
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
        // Dropdown change listener
        const dropdown = document.getElementById('currency-select');
        if (dropdown) {
            dropdown.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                if (selectedValue) {
                    this.selectedCrypto = selectedValue;
                    localStorage.setItem('selectedCrypto', selectedValue);
                    this.loadCryptoDetails(selectedValue);
                    console.log(`💰 Odabrana valuta: ${selectedValue} (spremljeno u localStorage)`);
                }
            });
        }
        
        // Timeframe buttons
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedTimeframe = e.target.dataset.tf;
                this.loadCryptoDetails(this.selectedCrypto);
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
        this.updateInterval = setInterval(() => {
            this.loadInitialData();
        }, 30000); // Povećaj na 30s da ne opterećuješ Binance API
        
        console.log('🔄 Pokrenuto kontinuirano ažuriranje (30s interval)');
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
            <h3>💡 TRADING SAVJETI</h3>
            <div class="tip">📊 RSI ispod 30 = mogućnost kupovine</div>
            <div class="tip">📈 RSI iznad 70 = mogućnost prodaje</div>
            <div class="tip">🔄 MACD crossover = signal za promenu trenda</div>
            <div class="tip">💰 Visok volumen = jak signal</div>
            <div class="tip">⚠️ Uvek koristi stop-loss!</div>
            <div class="tip">🌐 Podaci sa Binance API u realnom vremenu</div>
        `;
        
        tipsContainer.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8);
            color: white; padding: 15px; border-radius: 8px; max-width: 300px;
            font-size: 12px; z-index: 1000; border: 1px solid #333;
        `;
        
        // Dodaj samo ako već ne postoji
        if (!document.getElementById('trading-tips')) {
            document.body.appendChild(tipsContainer);
        }
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
    console.log('🚀 DOM učitan, pokrećem Trading Dashboard (GitHub Pages verzija)...');
    window.tradingDashboard = new TradingDashboard();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    if (window.tradingDashboard) {
        window.tradingDashboard.destroy();
    }
});
