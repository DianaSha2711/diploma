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


            if (method === 'POST') {// && data instanceof FormData
                options.body = data;
            } else if(method === 'GET' && data){
				url += "?" + data.toString();
			}

            console.log(`📡 Запрос: ${method} ${url}`, options || '');

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
    getFilm(id) {
        const films = this.getFilms();
		if(!films) return null;
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

    getHall(id) {
        const halls = this.getHalls();
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

    getSeances() {
		if(!this.oALLData) return []
        return this.oALLData.seances || [];
    }

    /**
     * Получить сеанс по ID
     * @param {number} id - ID сеанса
     * @returns {Promise<Object|null>} Объект сеанса или null
     */
    async getSeance(id) {
        await this.getAllData();

        const seances = this.oALLData.seances || [];
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
        formData.append('seanceId', bookingData.seanceId);
        formData.append('tickets', JSON.stringify(bookingData.tickets));
        formData.append('ticketDate', bookingData.ticketDate );
        return this.request('ticket', 'POST', formData);
    }

    async getBookings(seanceId, date = "2023-12-01") {
        if (!date) throw new Error('getBookings error: Нет seanceId');

		const params = new URLSearchParams({'seanceId': seanceId, 'date':date});
		return await this.request('hallconfig', 'GET', params);
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
        this.allData = await this.request('alldata');

        return {
            totalFilms:  this.allData.movies?.length || 0,
            totalMovies: this.allData.movies?.length || 0,
            totalHalls: this.allData.halls?.length || 0,
            todayBookings: this.allData.bookings?.filter(b => {
                const today = new Date().toISOString().split('T')[0];
                return b.date === today;
            }).length || 0,
            totalRevenue: this.allData.bookings?.reduce((sum, b) => sum + (b.total_price || b.totalPrice || 0), 0) || 0
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

/**
 * Вспомогательная функция для получения валидной даты в формате YYYY-MM-DD.
 * @param {string} dateStr - строка с датой для проверки.
 * @returns {string} - строка даты в формате YYYY-MM-DD (текущая, если входная невалидна).
 */
function getValidDateOrDefault(dateStr) {
    // Функция для получения сегодняшней даты в локальном формате YYYY-MM-DD
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Если аргумент не передан, возвращаем сегодня
    if (typeof dateStr !== 'string') {
        return getTodayString();
    }

    // Проверка формата регулярным выражением
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
        return getTodayString();
    }

    // Проверка, что дата реально существует (например, не 2023-02-30)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    // Проверяем, что после преобразования компоненты совпадают (корректная дата)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return getTodayString();
    }

    return dateStr;
}

console.log('✅ CinemaAPI загружен с поддержкой Films и Seances');
console.log('📌 Доступные методы:');
console.log('   - getFilms(), getFilm(), createFilm(), updateFilm(), deleteFilm()');
console.log('   - getSeances(), getSeance(), createSeance(), updateSeance(), deleteSeance()');
console.log('   - getStructuredData() - данные в новом формате');
console.log('📌 Сохранена обратная совместимость со старыми названиями');


