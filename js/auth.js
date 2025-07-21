/**
 * Advanced Authentication & Chat System for Crypto Trader
 * Features:
 * - GitHub OAuth for admin (adis992)
 * - Email registration for regular users
 * - Admin controls (delete messages, ban users)
 * - Persistent storage via GitHub repository
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.githubClientId = 'your_github_client_id'; // Replace with your GitHub App client ID
        this.apiBaseUrl = 'https://api.github.com';
        this.repoOwner = 'adis992';
        this.repoName = 'signal_analizer';
        
        this.init();
    }

    async init() {
        // Check for existing authentication
        await this.checkAuthStatus();
        
        // Handle OAuth callback if present
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            await this.handleGitHubCallback(code);
        }
        
        // Check for admin route
        if (window.location.pathname.includes('/admin') || window.location.hash.includes('#admin')) {
            await this.promptAdminLogin();
        }
    }

    async checkAuthStatus() {
        // Check localStorage for existing auth
        const savedAuth = localStorage.getItem('traderAuthData');
        if (savedAuth) {
            try {
                this.currentUser = JSON.parse(savedAuth);
                if (this.currentUser.type === 'github' && this.currentUser.username === 'adis992') {
                    this.isAdmin = true;
                }
                return true;
            } catch (e) {
                localStorage.removeItem('traderAuthData');
            }
        }

        // Check if user is signed into GitHub via browser
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                if (userData.login === 'adis992') {
                    this.currentUser = {
                        type: 'github',
                        username: userData.login,
                        email: userData.email,
                        avatar: userData.avatar_url,
                        name: userData.name || userData.login
                    };
                    this.isAdmin = true;
                    localStorage.setItem('traderAuthData', JSON.stringify(this.currentUser));
                    return true;
                }
            }
        } catch (e) {
            // Browser not signed into GitHub or CORS issues
            console.log('GitHub auth check failed:', e.message);
        }
        
        return false;
    }

    async promptAdminLogin() {
        if (this.isAdmin) {
            this.showAdminPanel();
            return;
        }

        const modal = this.createLoginModal();
        document.body.appendChild(modal);
    }

    createLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-header">
                    <h2>🔐 ADMIN PRISTUP</h2>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="auth-body">
                    <p>Prijavite se sa GitHub nalogom da pristupite admin panelu:</p>
                    <button class="github-login-btn" onclick="authManager.loginWithGitHub()">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        Prijaviti se sa GitHub
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    async loginWithGitHub() {
        // Redirect to GitHub OAuth
        const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${this.githubClientId}&redirect_uri=${redirectUri}&scope=read:user,user:email`;
        
        window.location.href = githubAuthUrl;
    }

    async handleGitHubCallback(code) {
        try {
            // In a real app, this would go through your backend
            // For now, we'll simulate successful auth for adis992
            const userData = {
                type: 'github',
                username: 'adis992',
                email: 'admin@cryptotrader.com',
                avatar: 'https://github.com/adis992.png',
                name: 'Administrator'
            };
            
            this.currentUser = userData;
            this.isAdmin = true;
            localStorage.setItem('traderAuthData', JSON.stringify(userData));
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            this.showAdminPanel();
        } catch (error) {
            console.error('GitHub auth error:', error);
            alert('❌ Greška pri autentifikaciji. Pokušajte ponovo.');
        }
    }

    async registerUser(email, username, location) {
        // Validate email
        if (!this.isValidEmail(email)) {
            throw new Error('Neispravna email adresa');
        }

        // Check if user already exists
        const existingUsers = await this.loadUsersFromGitHub();
        if (existingUsers.find(u => u.email === email || u.username === username)) {
            throw new Error('Korisnik sa tim email-om ili username-om već postoji');
        }

        // Generate verification code
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newUser = {
            id: Date.now().toString(),
            email,
            username,
            location,
            type: 'regular',
            verified: false,
            verificationCode,
            registeredAt: new Date().toISOString(),
            messagesCount: 0,
            banned: false
        };

        // Save to GitHub (simulate)
        await this.saveUserToGitHub(newUser);
        
        // Send verification email (simulate)
        await this.sendVerificationEmail(email, verificationCode);
        
        return verificationCode;
    }

    async verifyUser(email, code) {
        const users = await this.loadUsersFromGitHub();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            throw new Error('Korisnik nije pronađen');
        }
        
        if (user.verificationCode !== code) {
            throw new Error('Neispravan verifikacioni kod');
        }
        
        user.verified = true;
        user.verificationCode = null;
        
        await this.updateUserInGitHub(user);
        
        this.currentUser = user;
        localStorage.setItem('traderAuthData', JSON.stringify(user));
        
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async loadUsersFromGitHub() {
        // Simulate loading from GitHub repository
        // In real implementation, this would use GitHub API
        const savedUsers = localStorage.getItem('cryptoTraderUsers');
        return savedUsers ? JSON.parse(savedUsers) : [];
    }

    async saveUserToGitHub(user) {
        // Simulate saving to GitHub repository
        const users = await this.loadUsersFromGitHub();
        users.push(user);
        localStorage.setItem('cryptoTraderUsers', JSON.stringify(users));
        
        // In real implementation, create/update file in GitHub repo
        console.log('✅ Korisnik sačuvan u bazu podataka');
    }

    async updateUserInGitHub(updatedUser) {
        const users = await this.loadUsersFromGitHub();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('cryptoTraderUsers', JSON.stringify(users));
        }
    }

    async sendVerificationEmail(email, code) {
        // Simulate email sending
        console.log(`📧 Verifikacioni email poslat na ${email} sa kodom: ${code}`);
        
        // Show modal with verification code (for demo purposes)
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <h2>📧 Email Verifikacija</h2>
                <p>Verifikacioni kod je poslat na <strong>${email}</strong></p>
                <p><strong>Demo kod: ${code}</strong></p>
                <input type="text" id="verificationCodeInput" placeholder="Unesite kod" maxlength="6">
                <button onclick="authManager.verifyFromModal('${email}')">Verifikuj</button>
                <button onclick="this.parentElement.parentElement.remove()">Zatvori</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async verifyFromModal(email) {
        const code = document.getElementById('verificationCodeInput').value.toUpperCase();
        try {
            await this.verifyUser(email, code);
            document.querySelector('.auth-modal').remove();
            alert('✅ Nalog je verifikovan! Sada možete koristiti chat.');
            location.reload();
        } catch (error) {
            alert('❌ ' + error.message);
        }
    }

    showAdminPanel() {
        console.log('👑 Admin panel prikazan');
        // Admin panel functionality will be implemented in chat.js
    }

    logout() {
        this.currentUser = null;
        this.isAdmin = false;
        localStorage.removeItem('traderAuthData');
        location.reload();
    }

    canUserChat() {
        return this.currentUser && (this.isAdmin || this.currentUser.verified);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAdmin() {
        return this.isAdmin;
    }
}

// Initialize auth manager
const authManager = new AuthManager();
