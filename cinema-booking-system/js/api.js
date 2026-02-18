class CinemaAPI {
     oALLData = null;
    constructor(baseURL = 'https://shfe-diplom.neto-server.ru/') {
        this.baseURL = baseURL;
    }

  
    
    async request(endpoint, method = 'GET', data = null) {
        try {
            let url = this.baseURL + endpoint;
            let options = {
                method: method,
                headers: {}
            };

            
            if (method === 'POST' && data instanceof FormData) {
                options.body = data;
                
            }
           
            else if (method === 'POST' && data) {
                const formData = new FormData();
                Object.keys(data).forEach(key => {
                    formData.append(key, data[key]);
                });
                options.body = formData;
            }

            console.log(`📡 Запрос: ${method} ${url}`, data || '');
            
            const response = await fetch(url, options);
            const result = await response.json();
            
            console.log(`✅ Ответ:`, result);
            
            
            if (result.success === true) {
                return result.result;
            } else {
                throw new Error(result.error || 'Неизвестная ошибка');
            }
            
        } catch (error) {
            console.error(`❌ Ошибка запроса ${endpoint}:`, error);
            throw error;
        }
    }

    
   
    async getAllData() {
        this.oALLData = await this.request('alldata');
        return this.oALLData;
    }

 
    async login(username, password) {
        const formData = new FormData();
        formData.append('login', username);
        formData.append('password', password);
        
        return this.request('login', 'POST', formData);
    }

    // ============= FILMS (бывшие MOVIES) =============
    
    /**
     * Получить список всех фильмов
     * @returns {Promise<Array>} Массив фильмов
     */
     getFilms() {
        return this.oALLData.films || [];
    }

    /**
     * Получить фильм по ID
     * @param {number} id - ID фильма
     * @returns {Promise<Object|null>} Объект фильма или null
     */
    async getFilm(id) {
        const films = await this.getFilms();
        return films.find(f => f.id === parseInt(id)) || null;
    }

    /**
     * Создать новый фильм
     * @param {Object} filmData - Данные фильма
     * @returns {Promise<Object>} Результат создания
     */
    async createFilm(filmData) {
        const formData = new FormData();
        formData.append('title', filmData.title);
        formData.append('description', filmData.description || '');
        formData.append('duration', filmData.duration || 0);
        formData.append('genre', filmData.genre || '');
        formData.append('country', filmData.country || '');
        formData.append('rating', filmData.rating || 0);
        
        if (filmData.poster) {
            formData.append('poster', filmData.poster);
        }
        
        return this.request('movie/create', 'POST', formData);
    }

    /**
     * Обновить фильм
     * @param {number} id - ID фильма
     * @param {Object} filmData - Новые данные фильма
     * @returns {Promise<Object>} Результат обновления
     */
    async updateFilm(id, filmData) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('title', filmData.title);
        formData.append('description', filmData.description || '');
        formData.append('duration', filmData.duration || 0);
        formData.append('genre', filmData.genre || '');
        formData.append('country', filmData.country || '');
        formData.append('rating', filmData.rating || 0);
        
        if (filmData.poster) {
            formData.append('poster', filmData.poster);
        }
        
        return this.request('movie/update', 'POST', formData);
    }

    /**
     * Удалить фильм
     * @param {number} id - ID фильма
     * @returns {Promise<Object>} Результат удаления
     */
    async deleteFilm(id) {
        const formData = new FormData();
        formData.append('id', id);
        
        return this.request('movie/delete', 'POST', formData);
    }

    
    getHalls() {
        return this.oALLData.halls || [];
    }

    async getHall(id) {
        const halls = await this.getHalls();
        return halls.find(h => h.id === parseInt(id)) || null;
    }

    async createHall(hallData) {
        const formData = new FormData();
        formData.append('name', hallData.name);
        formData.append('rows', hallData.rows);
        formData.append('seats_per_row', hallData.seatsPerRow || hallData.seats_per_row);
        formData.append('vip_rows', hallData.vipRows || hallData.vip_rows || '');
        formData.append('has_3d', hallData.has3D || hallData.has_3d || false);
        formData.append('description', hallData.description || '');
        
        return this.request('hall/create', 'POST', formData);
    }

    async updateHall(id, hallData) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('name', hallData.name);
        formData.append('rows', hallData.rows);
        formData.append('seats_per_row', hallData.seatsPerRow || hallData.seats_per_row);
        formData.append('vip_rows', hallData.vipRows || hallData.vip_rows || '');
        formData.append('has_3d', hallData.has3D || hallData.has_3d || false);
        formData.append('description', hallData.description || '');
        
        return this.request('hall/update', 'POST', formData);
    }

    async deleteHall(id) {
        const formData = new FormData();
        formData.append('id', id);
        
        return this.request('hall/delete', 'POST', formData);
    }

    // ============= SEANCES (бывшие SCREENINGS) =============
    
    /**
     * Получить список всех сеансов
     * @param {string} date - Дата в формате YYYY-MM-DD (опционально)
     * @returns {Promise<Array>} Массив сеансов
     */
     getSeances() {
       return this.oALLData.seances || [];
    }

    /**
     * Получить сеанс по ID
     * @param {number} id - ID сеанса
     * @returns {Promise<Object|null>} Объект сеанса или null
     */
    async getSeance(id) {
        const seances = await this.getSeances();
        return seances.find(s => s.id === parseInt(id)) || null;
    }

    /**
     * Создать новый сеанс
     * @param {Object} seanceData - Данные сеанса
     * @returns {Promise<Object>} Результат создания
     */
    async createSeance(seanceData) {
        const formData = new FormData();
        formData.append('movie_id', seanceData.film_id || seanceData.movie_id || seanceData.filmId || seanceData.movieId);
        formData.append('hall_id', seanceData.hall_id || seanceData.hallId);
        formData.append('date', seanceData.date);
        formData.append('time', seanceData.time);
        formData.append('price', seanceData.price);
        formData.append('vip_price', seanceData.vipPrice || seanceData.vip_price || seanceData.price);
        
        return this.request('screening/create', 'POST', formData);
    }

    /**
     * Обновить сеанс
     * @param {number} id - ID сеанса
     * @param {Object} seanceData - Новые данные сеанса
     * @returns {Promise<Object>} Результат обновления
     */
    async updateSeance(id, seanceData) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('movie_id', seanceData.film_id || seanceData.movie_id || seanceData.filmId || seanceData.movieId);
        formData.append('hall_id', seanceData.hall_id || seanceData.hallId);
        formData.append('date', seanceData.date);
        formData.append('time', seanceData.time);
        formData.append('price', seanceData.price);
        formData.append('vip_price', seanceData.vipPrice || seanceData.vip_price || seanceData.price);
        
        return this.request('screening/update', 'POST', formData);
    }

    /**
     * Удалить сеанс
     * @param {number} id - ID сеанса
     * @returns {Promise<Object>} Результат удаления
     */
    async deleteSeance(id) {
        const formData = new FormData();
        formData.append('id', id);
        
        return this.request('screening/delete', 'POST', formData);
    }

    // Алиасы для обратной совместимости
    async getScreenings(date = null) {
        return this.getSeances(date);
    }

    async getScreening(id) {
        return this.getSeance(id);
    }

    async createScreening(seanceData) {
        return this.createSeance(seanceData);
    }

    async updateScreening(id, seanceData) {
        return this.updateSeance(id, seanceData);
    }

    async deleteScreening(id) {
        return this.deleteSeance(id);
    }

    // ============= BOOKINGS (без изменений) =============
   
    async createBooking(bookingData) {
        const formData = new FormData();
        formData.append('screening_id', bookingData.seance_id || bookingData.screening_id || bookingData.seanceId || bookingData.screeningId);
        formData.append('seats', JSON.stringify(bookingData.seats));
        formData.append('customer_name', bookingData.customerInfo?.name || bookingData.customer_name || '');
        formData.append('customer_email', bookingData.customerInfo?.email || bookingData.customer_email || '');
        formData.append('customer_phone', bookingData.customerInfo?.phone || bookingData.customer_phone || '');
        
        return this.request('booking/create', 'POST', formData);
    }

    async getBookings(date = null) {
        if (date) {
            const formData = new FormData();
            formData.append('date', date);
            return this.request('booking/get', 'POST', formData);
        }
        return this.request('booking/get');
    }

    async getBooking(code) {
        return this.request(`booking/${code}`);
    }

    async cancelBooking(code) {
        const formData = new FormData();
        formData.append('code', code);
        
        return this.request('booking/cancel', 'POST', formData);
    }

    // ============= DASHBOARD =============
   
    async getDashboardStats() {
        const data = await this.request('alldata');
        
        return {
            totalFilms: data.movies?.length || 0,
            totalMovies: data.movies?.length || 0,
            totalHalls: data.halls?.length || 0,
            todayBookings: data.bookings?.filter(b => {
                const today = new Date().toISOString().split('T')[0];
                return b.date === today;
            }).length || 0,
            totalRevenue: data.bookings?.reduce((sum, b) => sum + (b.total_price || b.totalPrice || 0), 0) || 0
        };
    }

    // ============= UTILITIES =============
  
    async ping() {
        try {
            await this.request('alldata');
            return true;
        } catch {
            return false;
        }
    }

    async uploadPoster(file) {
        const formData = new FormData();
        formData.append('poster', file);
        
        return this.request('poster/upload', 'POST', formData);
    }

    /**
     * Получить все данные в структурированном виде с новыми названиями
     * @returns {Promise<Object>} Структурированные данные
     */
    async getStructuredData() {
        const data = await this.request('alldata');
        
        return {
            films: data.movies || [],
            halls: data.halls || [],
            seances: (data.screenings || []).map(seance => ({
                ...seance,
                film: data.movies?.find(m => m.id === seance.movie_id),
                film_id: seance.movie_id,
                hall: data.halls?.find(h => h.id === seance.hall_id)
            })),
            bookings: data.bookings || []
        };
    }
}


const cinemaAPI = new CinemaAPI();


if (typeof window !== 'undefined') {
    window.cinemaAPI = cinemaAPI;
}


async function testAPI() {
    try {
       
        const allData = await cinemaAPI.getAllData();
        console.log('Все данные:', allData);
        
        
        const films = await cinemaAPI.getFilms();
        console.log('Фильмы:', films);
        
       
        const film = await cinemaAPI.getFilm(1);
        console.log('Фильм с ID 1:', film);
        
       
        const halls = await cinemaAPI.getHalls();
        console.log('Залы:', halls);
        
       
        const seances = await cinemaAPI.getSeances();
        console.log('Сеансы:', seances);
        
       
        const structuredData = await cinemaAPI.getStructuredData();
        console.log('Структурированные данные:', structuredData);
        
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


console.log('✅ CinemaAPI загружен с поддержкой Films и Seances');
console.log('📌 Доступные методы:');
console.log('   - getFilms(), getFilm(), createFilm(), updateFilm(), deleteFilm()');
console.log('   - getSeances(), getSeance(), createSeance(), updateSeance(), deleteSeance()');
console.log('   - getStructuredData() - данные в новом формате');
console.log('📌 Сохранена обратная совместимость со старыми названиями');