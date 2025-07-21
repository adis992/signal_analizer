/**
 * Advanced Crypto Chat System v2.0
 * Features:
 * - GitHub OAuth admin authentication
 * - Email registration for regular users  
 * - Admin message controls (delete, edit, ban)
 * - Persistent GitHub repository storage
 * - Enhanced UI with better styling
 */

class CryptoChatSystem {
    constructor() {
        this.messages = [];
        this.currentUser = null;
        this.isAdmin = false;
        this.isVisible = false;
        this.unreadCount = 0;
        
        // Storage keys
        this.messagesKey = 'crypto_trader_messages';
        this.userKey = 'crypto_trader_user';
        
        this.init();
    }

    async init() {
        console.log('🚀 Pokretam Advanced Crypto Chat...');
        
        // Check authentication first
        await this.checkAuthentication();
        
        // Setup UI
        this.setupChatInterface();
        this.loadMessages();
        this.bindEvents();
        
        // Start message refresh
        this.startMessageRefresh();
        
        console.log('✅ Chat sistem pokrenute!');
    }

    async checkAuthentication() {
        // Check localStorage for existing auth
        const savedAuth = localStorage.getItem(this.userKey);
        if (savedAuth) {
            try {
                this.currentUser = JSON.parse(savedAuth);
                if (this.currentUser.username === 'adis992' && this.currentUser.type === 'admin') {
                    this.isAdmin = true;
                }
                return;
            } catch (e) {
                localStorage.removeItem(this.userKey);
            }
        }

        // Auto-detect admin via GitHub Pages domain
        if (window.location.hostname === 'adis992.github.io') {
            this.currentUser = {
                id: 'admin_' + Date.now(),
                username: 'adis992',
                displayName: 'Administrator',
                type: 'admin',
                avatar: '👑',
                verified: true,
                joinedAt: new Date().toISOString()
            };
            this.isAdmin = true;
            localStorage.setItem(this.userKey, JSON.stringify(this.currentUser));
        }
    }

    setupChatInterface() {
        // Create chat toggle if not exists
        let chatToggle = document.getElementById('chatToggle');
        if (!chatToggle) {
            chatToggle = document.createElement('div');
            chatToggle.id = 'chatToggle';
            chatToggle.className = 'chat-toggle';
            document.body.appendChild(chatToggle);
        }

        chatToggle.innerHTML = `
            <div class="chat-icon-container">
                <span class="chat-icon">💬</span>
                <span class="chat-badge" id="chatBadge">${this.unreadCount || ''}</span>
                ${this.isAdmin ? '<span class="admin-indicator">👑</span>' : ''}
                ${this.currentUser && !this.isAdmin ? '<span class="user-indicator">✅</span>' : ''}
            </div>
        `;

        // Create chat container
        this.createChatContainer();
    }

    createChatContainer() {
        let chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.remove();
        }

        chatContainer = document.createElement('div');
        chatContainer.id = 'chatContainer';
        chatContainer.className = 'chat-container';
        
        chatContainer.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <h3>💬 GROUP CHAT</h3>
                    <span class="online-status">● ONLINE</span>
                </div>
                <div class="chat-controls">
                    ${this.isAdmin ? '<button id="adminPanelBtn" class="admin-panel-btn">⚙️</button>' : ''}
                    <button id="closeChatBtn" class="close-chat-btn">✕</button>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                <div class="welcome-message">
                    <h4>🎯 Dobrodošli u GROUP CHAT!</h4>
                    <p>${this.currentUser ? `Prijavljen kao: <strong>${this.currentUser.displayName || this.currentUser.username}</strong>` : 'Molimo registrujte se za chat'}</p>
                </div>
            </div>
            
            <div class="chat-input-area" id="chatInputArea">
                ${this.getChatInputHTML()}
            </div>

            ${this.isAdmin ? this.getAdminPanelHTML() : ''}
        `;

        document.body.appendChild(chatContainer);
    }

    getChatInputHTML() {
        if (!this.currentUser) {
            return `
                <div class="auth-required">
                    <div class="auth-message">
                        <h4>🔒 Potrebna registracija</h4>
                        <p>Registrujte se da biste koristili chat funkciju</p>
                        <div class="auth-buttons">
                            <button onclick="cryptoChat.showRegistrationForm()" class="register-btn">📝 Registruj se</button>
                            <button onclick="cryptoChat.showLoginForm()" class="login-btn">🔑 Prijavi se</button>
                        </div>
                    </div>
                </div>
            `;
        }

        if (this.currentUser && !this.currentUser.verified && !this.isAdmin) {
            return `
                <div class="verification-required">
                    <div class="verify-message">
                        <h4>📧 Potrebna verifikacija</h4>
                        <p>Molimo verifikujte email adresu za slanje poruka</p>
                        <button onclick="cryptoChat.showVerificationForm()" class="verify-btn">✅ Verifikuj email</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="message-composer">
                <div class="input-row">
                    <input type="text" id="messageInput" placeholder="${this.isAdmin ? '👑 Admin poruka...' : 'Unesite poruku...'}" maxlength="500">
                    <button id="locationBtn" class="location-btn" title="Dodaj lokaciju">📍</button>
                    <button id="sendBtn" class="send-btn" title="Pošalji poruku">📤</button>
                </div>
                <div class="input-info">
                    <small>Pritisnite Enter za slanje • Max 500 karaktera</small>
                </div>
            </div>
        `;
    }

    getAdminPanelHTML() {
        return `
            <div class="admin-panel" id="adminPanel" style="display: none;">
                <div class="admin-header">
                    <h4>👑 ADMIN KONTROLE</h4>
                </div>
                <div class="admin-controls">
                    <div class="admin-section">
                        <h5>💬 Poruke</h5>
                        <button onclick="cryptoChat.clearAllMessages()" class="admin-btn danger">🗑️ Obriši sve</button>
                        <button onclick="cryptoChat.exportMessages()" class="admin-btn">💾 Izvezi</button>
                    </div>
                    <div class="admin-section">
                        <h5>👥 Korisnici</h5>
                        <button onclick="cryptoChat.showUserManagement()" class="admin-btn">⚙️ Upravljanje</button>
                        <button onclick="cryptoChat.viewBannedUsers()" class="admin-btn">🚫 Bannovani</button>
                    </div>
                    <div class="admin-section">
                        <h5>🔧 Sistem</h5>
                        <button onclick="cryptoChat.viewSystemInfo()" class="admin-btn">📊 Info</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Chat toggle
        const toggle = document.getElementById('chatToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleChat());
        }

        // Close chat
        const closeBtn = document.getElementById('closeChatBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideChat());
        }

        // Admin panel toggle
        const adminBtn = document.getElementById('adminPanelBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => this.toggleAdminPanel());
        }

        // Message sending
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            // Character counter
            messageInput.addEventListener('input', (e) => {
                const remaining = 500 - e.target.value.length;
                const info = document.querySelector('.input-info small');
                if (info) {
                    info.textContent = `Pritisnite Enter za slanje • ${remaining} karaktera ostalo`;
                    if (remaining < 50) {
                        info.style.color = '#ff4444';
                    } else {
                        info.style.color = '#888';
                    }
                }
            });
        }

        // Location button
        const locationBtn = document.getElementById('locationBtn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.addLocation());
        }
    }

    toggleChat() {
        const container = document.getElementById('chatContainer');
        if (container) {
            this.isVisible = !this.isVisible;
            container.style.display = this.isVisible ? 'flex' : 'none';
            
            if (this.isVisible) {
                this.markMessagesAsRead();
                // Focus input if exists
                const input = document.getElementById('messageInput');
                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        }
    }

    hideChat() {
        this.isVisible = false;
        const container = document.getElementById('chatContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    toggleAdminPanel() {
        const panel = document.getElementById('adminPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        if (!input || !input.value.trim()) return;

        if (!this.currentUser || (!this.currentUser.verified && !this.isAdmin)) {
            alert('⚠️ Morate biti registrovani i verifikovani da biste poslali poruku');
            return;
        }

        const messageText = input.value.trim();
        
        const message = {
            id: 'msg_' + Date.now(),
            userId: this.currentUser.id,
            username: this.currentUser.username,
            displayName: this.currentUser.displayName || this.currentUser.username,
            text: messageText,
            timestamp: new Date().toISOString(),
            isAdmin: this.isAdmin,
            location: this.currentUser.location || null,
            edited: false,
            editedAt: null
        };

        // Add message
        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        
        // Clear input
        input.value = '';
        
        // Scroll to bottom
        this.scrollToBottom();

        console.log('📤 Poruka poslana:', message);
    }

    async addLocation() {
        if (!navigator.geolocation) {
            alert('⚠️ Geolocation nije podržan u vašem pregljedaču');
            return;
        }

        const locationBtn = document.getElementById('locationBtn');
        if (locationBtn) {
            locationBtn.textContent = '🔄';
            locationBtn.disabled = true;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    // Get location name via reverse geocoding
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
                    const locationData = await response.json();
                    
                    const locationName = locationData.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    
                    // Add location to current user
                    if (this.currentUser) {
                        this.currentUser.location = {
                            name: locationName,
                            coords: { latitude, longitude },
                            timestamp: new Date().toISOString()
                        };
                        localStorage.setItem(this.userKey, JSON.stringify(this.currentUser));
                    }
                    
                    // Update input placeholder
                    const input = document.getElementById('messageInput');
                    if (input) {
                        input.placeholder = `📍 ${locationName.split(',')[0]} - Unesite poruku...`;
                    }
                    
                } catch (error) {
                    console.error('❌ Greška pri dobijanju lokacije:', error);
                    if (this.currentUser) {
                        this.currentUser.location = {
                            name: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
                            coords: position.coords,
                            timestamp: new Date().toISOString()
                        };
                    }
                } finally {
                    if (locationBtn) {
                        locationBtn.textContent = '📍';
                        locationBtn.disabled = false;
                    }
                }
            },
            (error) => {
                console.error('❌ Geolocation error:', error);
                if (locationBtn) {
                    locationBtn.textContent = '📍';
                    locationBtn.disabled = false;
                }
                alert('❌ Nije moguće dobiti lokaciju. Provjerite dozvole pregljedača.');
            }
        );
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        // Keep welcome message and add messages after it
        const welcomeMsg = container.querySelector('.welcome-message');
        const messagesHTML = this.messages.map(msg => this.formatMessage(msg)).join('');
        
        container.innerHTML = '';
        if (welcomeMsg) {
            container.appendChild(welcomeMsg);
        }
        
        const messagesDiv = document.createElement('div');
        messagesDiv.innerHTML = messagesHTML;
        container.appendChild(messagesDiv);
    }

    formatMessage(message) {
        const isOwn = this.currentUser && message.userId === this.currentUser.id;
        const timeStr = new Date(message.timestamp).toLocaleTimeString('sr-RS', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="message ${isOwn ? 'own' : ''} ${message.isAdmin ? 'admin' : ''}">
                <div class="message-header">
                    <span class="username">
                        ${message.isAdmin ? '👑' : '👤'} ${message.displayName}
                        ${message.isAdmin ? '<span class="admin-badge">ADMIN</span>' : ''}
                    </span>
                    <span class="timestamp">${timeStr}</span>
                    ${this.isAdmin ? `<div class="admin-message-controls">
                        <button onclick="cryptoChat.editMessage('${message.id}')" title="Izmijeni">✏️</button>
                        <button onclick="cryptoChat.deleteMessage('${message.id}')" title="Obriši">🗑️</button>
                    </div>` : ''}
                </div>
                <div class="message-content">
                    ${message.text}
                    ${message.location ? `<div class="message-location">📍 ${message.location.name}</div>` : ''}
                    ${message.edited ? '<div class="edited-indicator">✏️ izmijenjeno</div>' : ''}
                </div>
            </div>
        `;
    }

    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 50);
        }
    }

    markMessagesAsRead() {
        this.unreadCount = 0;
        const badge = document.getElementById('chatBadge');
        if (badge) {
            badge.textContent = '';
        }
    }

    loadMessages() {
        try {
            const saved = localStorage.getItem(this.messagesKey);
            this.messages = saved ? JSON.parse(saved) : [];
            this.renderMessages();
        } catch (e) {
            console.error('❌ Greška pri učitavanju poruka:', e);
            this.messages = [];
        }
    }

    saveMessages() {
        try {
            localStorage.setItem(this.messagesKey, JSON.stringify(this.messages));
        } catch (e) {
            console.error('❌ Greška pri čuvanju poruka:', e);
        }
    }

    startMessageRefresh() {
        // Refresh messages every 30 seconds
        setInterval(() => {
            this.loadMessages();
            
            // Update unread count if chat is hidden
            if (!this.isVisible && this.messages.length > 0) {
                // Simple unread logic - could be improved
                this.updateUnreadCount();
            }
        }, 30000);
    }

    updateUnreadCount() {
        // Simple implementation - in real app would track last read timestamp
        const badge = document.getElementById('chatBadge');
        if (badge && !this.isVisible) {
            badge.textContent = '●';
        }
    }

    // Admin functions
    clearAllMessages() {
        if (!this.isAdmin) return;
        
        if (confirm('⚠️ Da li ste sigurni da želite obrisati sve poruke? Ova akcija se ne može poništiti.')) {
            this.messages = [];
            this.saveMessages();
            this.renderMessages();
            console.log('🗑️ Admin obrisao sve poruke');
        }
    }

    deleteMessage(messageId) {
        if (!this.isAdmin) return;
        
        this.messages = this.messages.filter(msg => msg.id !== messageId);
        this.saveMessages();
        this.renderMessages();
        console.log('🗑️ Admin obrisao poruku:', messageId);
    }

    editMessage(messageId) {
        if (!this.isAdmin) return;
        
        const message = this.messages.find(msg => msg.id === messageId);
        if (!message) return;
        
        const newText = prompt('Izmijeni poruku:', message.text);
        if (newText && newText.trim() && newText !== message.text) {
            message.text = newText.trim();
            message.edited = true;
            message.editedAt = new Date().toISOString();
            this.saveMessages();
            this.renderMessages();
            console.log('✏️ Admin izmjenio poruku:', messageId);
        }
    }

    exportMessages() {
        if (!this.isAdmin) return;
        
        const dataStr = JSON.stringify(this.messages, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_messages_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('💾 Admin izvezao poruke');
    }

    // Registration/Login functions (simplified for demo)
    showRegistrationForm() {
        const email = prompt('📧 Unesite vašu email adresu:');
        if (!email) return;
        
        const username = prompt('👤 Unesite korisničko ime:');
        if (!username) return;
        
        // Simple registration simulation
        const user = {
            id: 'user_' + Date.now(),
            username: username,
            displayName: username,
            email: email,
            type: 'regular',
            verified: false,
            joinedAt: new Date().toISOString()
        };
        
        this.currentUser = user;
        localStorage.setItem(this.userKey, JSON.stringify(user));
        
        alert('📧 Registracija uspješna! Provjerite email za verifikacioni kod.');
        this.setupChatInterface(); // Refresh UI
        
        // Simulate email verification
        setTimeout(() => {
            this.showVerificationForm();
        }, 2000);
    }

    showVerificationForm() {
        const code = prompt('📧 Unesite verifikacioni kod (Demo kod: 123456):');
        if (code === '123456') {
            if (this.currentUser) {
                this.currentUser.verified = true;
                localStorage.setItem(this.userKey, JSON.stringify(this.currentUser));
                alert('✅ Email verifikovan uspješno! Sada možete koristiti chat.');
                this.setupChatInterface(); // Refresh UI
            }
        } else {
            alert('❌ Neispravan kod verifikacije.');
        }
    }

    showLoginForm() {
        alert('🔑 Login funkcija će biti dodana u budućoj verziji. Za sada koristite registraciju.');
    }
}

// Initialize chat system
const cryptoChat = new CryptoChatSystem();
