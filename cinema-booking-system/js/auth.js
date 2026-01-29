
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.tokenKey = 'cinema_admin_token';
        this.userKey = 'cinema_admin_user';
        this.init();
    }

    init() {
        
        const token = localStorage.getItem(this.tokenKey);
        const user = localStorage.getItem(this.userKey);
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.token = token;
        }
    }

    
    async login(username, password) {
        try {
            
            if (username === 'admin' && password === 'admin123') {
                const user = {
                    id: 1,
                    username: 'admin',
                    name: 'Администратор',
                    role: 'admin',
                    email: 'admin@cinema.ru'
                };
                
                const token = this.generateToken(user);
                
                this.currentUser = user;
                this.token = token;
                
                
                localStorage.setItem(this.tokenKey, token);
                localStorage.setItem(this.userKey, JSON.stringify(user));
                
                return { success: true, user };
            } else {
                return { 
                    success: false, 
                    error: 'Неверный логин или пароль' 
                };
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: 'Ошибка сервера' };
        }
    }

    
    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.href = 'login.html';
    }

    
    isAuthenticated() {
        return this.currentUser !== null;
    }

    
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    
    generateToken(user) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            name: user.name,
            role: user.role,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
        }));
        return `${header}.${payload}.demo_signature`;
    }

    
    validateToken(token) {
        if (!token) return false;
        
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            const payload = JSON.parse(atob(parts[1]));
            return payload.exp > Date.now();
        } catch (error) {
            return false;
        }
    }

    
    getUser() {
        return this.currentUser;
    }

    
    getToken() {
        return this.token;
    }

    
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}


const auth = new AuthManager();