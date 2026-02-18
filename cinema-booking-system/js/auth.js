

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
            console.log('🔄 Попытка входа:', username);
            
            
            const result = await cinemaAPI.login(username, password);
            
            console.log('✅ Успешный вход:', result);
            
            
            const user = {
                id: result.user?.id || 1,
                username: username,
                name: result.user?.name || 'Администратор',
                role: result.user?.role || 'admin',
                email: result.user?.email || ''
            };
            
            const token = result.token || 'session_' + Date.now();
            
            this.currentUser = user;
            this.token = token;
            
            
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            
            
            if (username === 'admin' && password === 'admin123') {
                console.warn('⚠️ Используем демо-режим (сервер не доступен)');
                
                const demoUser = {
                    id: 1,
                    username: 'admin',
                    name: 'Администратор',
                    role: 'admin',
                    email: 'admin@cinema.ru'
                };
                
                const demoToken = 'demo_token_' + Date.now();
                
                this.currentUser = demoUser;
                this.token = demoToken;
                
                localStorage.setItem(this.tokenKey, demoToken);
                localStorage.setItem(this.userKey, JSON.stringify(demoUser));
                
                return { success: true, user: demoUser, demo: true };
            }
            
            return { 
                success: false, 
                error: error.message || 'Ошибка авторизации'
            };
        }
    }

    
    logout() {
        console.log('🔄 Выход из системы');
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        
        if (window.cinemaAPI && cinemaAPI.logout) {
            cinemaAPI.logout().catch(console.warn);
        }
        
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    getUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

   
    async validateSession() {
        if (!this.token) return false;
        
        try {
            
            const result = await window.cinemaAPI?.getAllData();
            return !!result;
        } catch (error) {
            console.warn('⚠️ Сессия недействительна:', error);
            return false;
        }
    }
}


const auth = new AuthManager();


if (typeof window !== 'undefined') {
    window.auth = auth;
}

console.log('✅ AuthManager загружен');