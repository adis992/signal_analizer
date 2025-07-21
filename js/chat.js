class RealTimeChat {
    constructor() {
        this.messages = [];
        this.currentUser = null;
        this.isAdmin = false;
        this.storageKey = 'crypto_chat_messages';
        this.userKey = 'crypto_chat_user';
        this.locationKey = 'crypto_chat_location';
        this.notificationPermission = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Pokretam Real-Time Chat sistem...');
        
        // Provjeri admin status
        this.checkAdminStatus();
        
        // Učitaj postojeće poruke
        this.loadMessages();
        
        // Provjeri korisnika
        await this.checkUser();
        
        // Pokreni chat
        this.setupChat();
        
        // Pokreni auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ Chat sistem uspješno pokrenute!');
    }

    checkAdminStatus() {
        // Provjeri GitHub admin status kroz različite načine
        const gitUser = localStorage.getItem('github_user');
        const isGitHub = window.location.hostname === 'adis992.github.io';
        
        // Provjeri admin kombinacije
        this.isAdmin = (
            gitUser === 'adis992' || 
            localStorage.getItem('admin_verified') === 'true' ||
            (isGitHub && this.isMainAdmin())
        );
        
        if (this.isAdmin) {
            console.log('👑 Admin status potvrđen!');
            document.body.classList.add('admin-mode');
        }
    }

    isMainAdmin() {
        // Dodatne provjere za glavnog admina
        const adminSignatures = [
            'adis992',
            'signal_analizer_admin',
            'tarik_crypto_admin'
        ];
        
        return adminSignatures.some(sig => 
            localStorage.getItem('user_signature') === sig ||
            sessionStorage.getItem('admin_token') === sig
        );
    }

    loadMessages() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.messages = JSON.parse(stored);
        }
    }

    saveMessages() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    }

    async checkUser() {
        let user = localStorage.getItem(this.userKey);
        
        if (!user) {
            // Nova registracija korisnika
            const name = prompt('🔐 Unesite vaše ime za chat:');
            const email = prompt('📧 Unesite email (opcionalno):') || '';
            
            if (!name) {
                alert('❌ Ime je obavezno za chat!');
                return;
            }
            
            user = {
                name: name.trim(),
                email: email.trim(),
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                joined: new Date().toISOString(),
                location: null
            };
            
            // Traži lokaciju
            await this.requestLocation(user);
            
            localStorage.setItem(this.userKey, JSON.stringify(user));
        } else {
            user = JSON.parse(user);
        }
        
        this.currentUser = user;
        
        // Ažuriraj admin status
        if (user.name.toLowerCase().includes('adis') || user.email.includes('adis992')) {
            this.isAdmin = true;
            localStorage.setItem('admin_verified', 'true');
        }
    }

    async requestLocation(user) {
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    });
                });
                
                user.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: Date.now()
                };
                
                // Dobij naziv mjesta preko reverse geocoding
                user.locationName = await this.getLocationName(
                    position.coords.latitude, 
                    position.coords.longitude
                );
                
            } catch (error) {
                console.log('📍 Korisnik nije dozvolio lokaciju:', error);
                user.location = null;
                user.locationName = 'Nepoznato mjesto';
            }
        }
    }

    async getLocationName(lat, lon) {
        try {
            // Koristi OpenStreetMap Nominatim API (besplatan)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || '';
                const country = data.address.country || '';
                return city ? `${city}, ${country}` : country || 'Nepoznato mjesto';
            }
            
        } catch (error) {
            console.error('❌ Greška pri dobijanju lokacije:', error);
        }
        
        return 'Nepoznato mjesto';
    }

    setupChat() {
        // Kreiraj chat UI
        this.createChatUI();
        
        // Setup event listenere
        this.setupEventListeners();
        
        // Pokaži postojeće poruke
        this.renderMessages();
        
        // Pokreni notifikacije
        this.requestNotificationPermission();
    }

    createChatUI() {
        const chatHTML = `
            <div id="chat-container" class="chat-container">
                <div class="chat-header">
                    <div class="chat-title">
                        <span>💬 CRYPTO CHAT</span>
                        ${this.isAdmin ? '<span class="admin-badge">👑 ADMIN</span>' : ''}
                    </div>
                    <div class="chat-controls">
                        <button id="chat-toggle" class="chat-toggle">📱</button>
                        <button id="chat-minimize" class="chat-minimize">➖</button>
                    </div>
                </div>
                
                <div class="chat-body" id="chat-body">
                    <div class="chat-messages" id="chat-messages"></div>
                    
                    <div class="chat-input-container">
                        <input 
                            type="text" 
                            id="chat-input" 
                            class="chat-input" 
                            placeholder="Napišite poruku..."
                            maxlength="500"
                        >
                        <button id="chat-send" class="chat-send">📤</button>
                    </div>
                    
                    <div class="chat-user-info">
                        <span class="user-name">${this.currentUser?.name || 'Anoniman'}</span>
                        <span class="user-location">${this.currentUser?.locationName || ''}</span>
                    </div>
                </div>
                
                ${this.isAdmin ? this.createAdminPanel() : ''}
            </div>
        `;
        
        // Dodaj chat u body
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    createAdminPanel() {
        return `
            <div class="admin-panel">
                <div class="admin-header">👑 ADMIN PANEL</div>
                <div class="admin-actions">
                    <button id="admin-broadcast" class="admin-btn">📢 Pošalji svima</button>
                    <button id="admin-clear" class="admin-btn">🗑️ Obriši chat</button>
                    <button id="admin-users" class="admin-btn">👥 Korisnici</button>
                </div>
                <textarea 
                    id="admin-message" 
                    class="admin-textarea" 
                    placeholder="Administratorska poruka..."
                ></textarea>
            </div>
        `;
    }

    setupEventListeners() {
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        if (chatInput && chatSend) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            chatSend.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // Chat kontrole
        const chatToggle = document.getElementById('chat-toggle');
        const chatMinimize = document.getElementById('chat-minimize');
        
        if (chatToggle) {
            chatToggle.addEventListener('click', () => {
                this.toggleChat();
            });
        }
        
        if (chatMinimize) {
            chatMinimize.addEventListener('click', () => {
                this.minimizeChat();
            });
        }
        
        // Admin kontrole
        if (this.isAdmin) {
            this.setupAdminControls();
        }
    }

    setupAdminControls() {
        const broadcastBtn = document.getElementById('admin-broadcast');
        const clearBtn = document.getElementById('admin-clear');
        const usersBtn = document.getElementById('admin-users');
        
        if (broadcastBtn) {
            broadcastBtn.addEventListener('click', () => {
                this.sendAdminBroadcast();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearChat();
            });
        }
        
        if (usersBtn) {
            usersBtn.addEventListener('click', () => {
                this.showUsers();
            });
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const messageText = input?.value?.trim();
        
        if (!messageText || !this.currentUser) return;
        
        const message = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            text: messageText,
            user: {
                name: this.currentUser.name,
                id: this.currentUser.id,
                location: this.currentUser.locationName || 'Nepoznato'
            },
            timestamp: Date.now(),
            isAdmin: this.isAdmin,
            type: 'user'
        };
        
        this.addMessage(message);
        input.value = '';
        
        // Notifikoj ostale korisnike
        this.notifyNewMessage(message);
    }

    sendAdminBroadcast() {
        const textarea = document.getElementById('admin-message');
        const messageText = textarea?.value?.trim();
        
        if (!messageText) {
            alert('❌ Unesite poruku za broadcast!');
            return;
        }
        
        const message = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            text: messageText,
            user: {
                name: 'SISTEM',
                id: 'admin',
                location: 'Admin Panel'
            },
            timestamp: Date.now(),
            isAdmin: true,
            type: 'admin_broadcast'
        };
        
        this.addMessage(message);
        textarea.value = '';
        
        // Special notification za admin poruke
        this.showNotification('📢 ADMIN PORUKA', messageText);
    }

    addMessage(message) {
        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        this.scrollToBottom();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageEl = this.createMessageElement(message);
            messagesContainer.appendChild(messageEl);
        });
        
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.type}`;
        
        if (message.user.id === this.currentUser?.id) {
            messageDiv.classList.add('own-message');
        }
        
        const timeStr = new Date(message.timestamp).toLocaleTimeString('sr-RS', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const adminBadge = message.isAdmin ? '<span class="admin-badge">👑</span>' : '';
        const locationInfo = message.user.location ? `📍 ${message.user.location}` : '';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-user">${message.user.name} ${adminBadge}</span>
                <span class="message-location">${locationInfo}</span>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-text">${this.escapeHtml(message.text)}</div>
        `;
        
        return messageDiv;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    toggleChat() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.classList.toggle('minimized');
        }
    }

    minimizeChat() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.classList.add('hidden');
        }
    }

    clearChat() {
        if (confirm('⚠️ Da li ste sigurni da želite obrisati sve poruke?')) {
            this.messages = [];
            this.saveMessages();
            this.renderMessages();
            
            // Dodaj admin poruku o brisanju
            const clearMessage = {
                id: Date.now(),
                text: 'Chat je obrisan od strane administratora.',
                user: { name: 'SISTEM', id: 'system', location: 'Admin' },
                timestamp: Date.now(),
                isAdmin: true,
                type: 'system'
            };
            
            this.addMessage(clearMessage);
        }
    }

    showUsers() {
        const uniqueUsers = [...new Set(this.messages.map(m => JSON.stringify(m.user)))]
            .map(u => JSON.parse(u));
        
        const usersList = uniqueUsers.map(user => 
            `${user.name} ${user.location ? `(${user.location})` : ''}`
        ).join('\n');
        
        alert(`👥 AKTIVNI KORISNICI:\n\n${usersList}`);
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = (permission === 'granted');
            
            if (this.notificationPermission) {
                console.log('🔔 Browser notifikacije omogućene');
            }
        }
    }

    showNotification(title, body, icon = '💬') {
        if (this.notificationPermission && document.hidden) {
            new Notification(title, {
                body: body,
                icon: icon,
                badge: icon,
                tag: 'crypto-chat'
            });
        }
    }

    notifyNewMessage(message) {
        if (message.user.id !== this.currentUser?.id) {
            this.showNotification(
                `💬 ${message.user.name}`,
                message.text,
                '🚀'
            );
        }
    }

    startAutoRefresh() {
        // Provjeri nove poruke svakih 5 sekundi
        setInterval(() => {
            this.checkForNewMessages();
        }, 5000);
        
        // Provjeri kad se tab aktivira
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForNewMessages();
            }
        });
    }

    checkForNewMessages() {
        // Ova funkcija bi u realnom sistemu provjerila server
        // Za sada samo ažurira UI ako je potrebno
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            const storedMessages = JSON.parse(stored);
            if (storedMessages.length > this.messages.length) {
                this.messages = storedMessages;
                this.renderMessages();
                
                // Prikaži notifikaciju za novu poruku
                const newMessage = storedMessages[storedMessages.length - 1];
                if (newMessage.user.id !== this.currentUser?.id) {
                    this.notifyNewMessage(newMessage);
                }
            }
        }
    }
}

// Automatski pokretaj chat sistema
document.addEventListener('DOMContentLoaded', () => {
    window.cryptoChat = new RealTimeChat();
});
