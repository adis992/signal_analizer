# 🚀 CRYPTO SIGNAL TRACKER

**Profesionalni Crypto Trading Signali sa Premium Analizom**

![Crypto Tracker](https://img.shields.io/badge/Crypto-Trading-blue)
![Real Time](https://img.shields.io/badge/Real%20Time-Binance%20API-green)
![Serbian](https://img.shields.io/badge/Language-Serbian-red)

## 📊 Opis

Premium crypto trading dashboard koji pruža profesionalne signale za trgovinu kriptovalutama. Aplikacija koristi Binance API za podatke u realnom vremenu i generiše pametniju tehničku analizu sa predviđanjima.

### 🌟 Ključne Funkcionalnosti

- **📈 35+ Kriptovaluta**: Bitcoin, Ethereum, Solana, XRP, ADA, DOT, LINK...
- **🔮 Pametna Predviđanja**: 1m, 3m, 15m, 1h, 4h, 6h, 12h, 1d, 1w, 1M
- **📊 Tehnička Analiza**: RSI, MACD, Bollinger Bands, EMA, Volume, Stochastic RSI
- **🎯 Ukupna Tačnost**: Dinamički kalkuliran consensus signal
- **⏰ Multi-Timeframe**: Analiza kroz različite vremenske okvire
- **🌍 Srpski Jezik**: Kompletno na srpskom jeziku
- **📱 Responsive**: Radi na svim uređajima

### 💎 Crypto Ikone i Signali

- ₿ Bitcoin - 🚀 KUPUJ/📉 PRODAJ/😴 SPAVA
- Ξ Ethereum - 📈 RAST/💥 VOLATILNO
- ◉ Solana - 🔥 HOT/💎 TOP
- ◈ XRP, ◊ ADA, ● DOT, 🔗 LINK...

## 🚀 GitHub Pages Deployment

### Lokalno Pokretanje (Development)

```bash
# Kloniraj repo
git clone https://github.com/[username]/crypto-signal-tracker.git
cd crypto-signal-tracker

# Pokreni lokalni server (Node.js verzija)
node server.js
```

### GitHub Pages (Production)

1. **Pushuj na GitHub:**
```bash
git init
git add .
git commit -m "🚀 Početni commit - Crypto Signal Tracker"
git branch -M main
git remote add origin https://github.com/[username]/crypto-signal-tracker.git
git push -u origin main
```

2. **Aktiviraj GitHub Pages:**
   - Idi na GitHub repo Settings
   - Scroll do "Pages" sekcije
   - Odaberi "Deploy from a branch"
   - Odaberi "main" branch i "/ (root)" folder
   - Klikni "Save"

3. **Koristi GitHub verziju:**
   - Preimenuj `index_github.html` u `index.html`
   - Koristi `script_github.js` umesto `script.js`

## 📁 Struktura Projekta

```
crypto-signal-tracker/
├── index.html              # Glavna HTML stranica (lokalna verzija)
├── index_github.html       # GitHub Pages verzija
├── css/
│   └── style.css           # Glavni CSS styling
├── js/
│   ├── script.js           # JavaScript (lokalna verzija sa server API)
│   └── script_github.js    # GitHub Pages verzija (direktno Binance API)
├── server.js               # Node.js backend server (samo lokalno)
├── package.json            # Node.js dependencies (samo lokalno)
├── .gitignore             # Git ignore fajl
└── README.md              # Dokumentacija
```

## 🔧 Tehnički Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Charts**: Chart.js
- **API**: Binance Public API
- **Backend** (lokalno): Node.js, Express
- **Deployment**: GitHub Pages

## 📊 API Endpoints (Lokalna Verzija)

- `GET /api/crypto-list` - Lista svih kriptovaluta
- `GET /api/analyze/:symbol/:timeframe` - Tehnička analiza
- `GET /api/predictions/:symbol` - Predviđanja cena
- `GET /api/chart-data/:symbol/:timeframe` - Chart podaci
- `GET /api/multi-timeframe/:symbol` - Multi-timeframe analiza

## 🎨 Styling Features

- **Dark Theme**: Profesionalni tamni izgled
- **Gradijenti**: Premium vizuelni efekti
- **Responsive Grid**: Adaptivni layout
- **Crypto Ikone**: Jedinstvene ikone za svaku valutu
- **Signal Colors**: Zeleno/Crveno za Bull/Bear signale
- **Progress Bars**: Vizuelni indikatori za RSI
- **Pulse Animacije**: "Live" indikatori

## 🔮 Predviđanja i Signali

### Tipovi Signala:
- **🚀 JAKO KUPUJ** - Snažan bullish signal
- **📈 KUPUJ** - Pozitivan signal
- **➡️ DRŽI** - Neutralan signal
- **📉 PRODAJ** - Negativan signal
- **💥 JAKO PRODAJ** - Snažan bearish signal

### Timeframe Analiza:
- **Kratkoročno**: 1m, 3m, 15m (0.1-0.5% promene)
- **Srednjoročno**: 1h, 4h, 6h (0.5-1.5% promene)
- **Dugoročno**: 12h, 1d, 1w, 1M (1-5% promene)

## 💡 Trading Saveti

- 📊 **RSI ispod 30** = mogućnost kupovine
- 📈 **RSI iznad 70** = mogućnost prodaje
- 🔄 **MACD crossover** = signal za promenu trenda
- 💰 **Visok volumen** = jak signal
- ⚠️ **Uvek koristi stop-loss!**

## 🌐 Live Demo

GitHub Pages: `https://[username].github.io/crypto-signal-tracker/`

## 📝 Licenca

MIT License - Slobodno korišćenje i modifikacija.

## ⚠️ Disclaimer

Ova aplikacija je za edukacione svrhe. Signali nisu finansijski saveti. Uvek radite vlastito istraživanje pre investiranja.

---

**Made with ❤️ by [Your Name] | Powered by Binance API**
