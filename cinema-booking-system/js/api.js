

class CinemaAPI {
    constructor(baseURL = '') {  
        this.baseURL = baseURL;
    }

    
    
    async login(username, password) {
        console.log('Попытка входа:', username);
        
        
        if (username === 'admin' && password === 'admin123') {
           
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const user = {
                id: 1,
                username: 'admin',
                name: 'Администратор',
                role: 'admin',
                email: 'admin@cinema.ru'
            };
            
            const token = 'demo.jwt.token.' + Date.now();
            
            
            localStorage.setItem('cinema_admin_token', token);
            localStorage.setItem('cinema_admin_user', JSON.stringify(user));
            
            return {
                token: token,
                user: user
            };
        }
        
        throw new Error('Неверный логин или пароль');
    }
    
    async logout() {
        localStorage.removeItem('cinema_admin_token');
        localStorage.removeItem('cinema_admin_user');
        return true;
    }
    
    async validateSession() {
        const token = localStorage.getItem('cinema_admin_token');
        return !!token; 
    }

    
    
    async getMovies() {
        console.log('Загрузка фильмов...');
        
        
        return [
            {
                id: 1,
                title: "Дюна: Часть вторая",
                description: "Продолжение эпической саги по мотивам романа Фрэнка Герберта. Пол Атрейдес объединяется с Чани и фременами.",
                genre: "Фантастика",
                duration: 166,
                poster: "https://m.media-amazon.com/images/M/MV5BODI0YjNhNjUtYzE2MC00ZDI1LWE5OTgtODVmNDg1N2Q2MzUxXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_FMjpg_UX1000_.jpg",
                rating: 8.5,
                year: 2024
            },
            {
                id: 2,
                title: "Оппенгеймер",
                description: "История американского ученого Джулиуса Роберта Оппенгеймера и его роли в разработке атомной бомбы.",
                genre: "Биография, Драма",
                duration: 180,
                poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_FMjpg_UX1000_.jpg",
                rating: 8.3,
                year: 2023
            },
            {
                id: 3,
                title: "Миссия невыполнима",
                description: "Итан Хант и его команда должны найти новое оружие, угрожающее всему человечеству.",
                genre: "Боевик",
                duration: 163,
                poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/4486454/a0d8a4bc-457d-4b90-a915-75a4f6e2d9b8/600x900",
                rating: 7.8,
                year: 2023
            },
            {
                id: 4,
                title: "Элементарно",
                description: "В Element City воздух, земля, огонь и вода живут вместе. История встречи предприимчивой Эмбер и весельчака Уэйда.",
                genre: "Мультфильм, Комедия",
                duration: 102,
                poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/10835644/7c081efa-85b7-4276-8c6e-0a1ef3c5b7ea/600x900",
                rating: 7.5,
                year: 2023
            }
        ];
    }
    
    async getMovie(id) {
        const movies = await this.getMovies();
        return movies.find(movie => movie.id === parseInt(id)) || null;
    }
    
    async getHalls() {
        console.log('Загрузка залов...');
        
        return [
            {
                id: 1,
                name: "IMAX",
                rows: 10,
                seatsPerRow: 15,
                vipRows: [1, 2],
                has3D: true,
                description: "Зал с технологией IMAX, экран 20×12 метров"
            },
            {
                id: 2,
                name: "Комфорт",
                rows: 8,
                seatsPerRow: 12,
                vipRows: [1],
                has3D: false,
                description: "Зал с увеличенным расстоянием между рядами"
            },
            {
                id: 3,
                name: "Стандарт",
                rows: 12,
                seatsPerRow: 18,
                vipRows: [1, 2, 3],
                has3D: true,
                description: "Стандартный зал с системой Dolby Atmos"
            }
        ];
    }
    
    async getHall(id) {
        const halls = await this.getHalls();
        return halls.find(hall => hall.id === parseInt(id)) || null;
    }
    
    async getScreenings(date = null) {
        console.log('Загрузка сеансов...', date);
        
        
        if (!date) {
            const today = new Date();
            date = today.toISOString().split('T')[0];
        }
        
        return [
            {
                id: 1,
                movieId: 1,
                hallId: 1,
                date: date,
                time: "10:00",
                price: 500,
                vipPrice: 800,
                bookedSeats: [
                    { row: 5, seat: 7 },
                    { row: 5, seat: 8 },
                    { row: 6, seat: 5 }
                ],
                movie: {
                    id: 1,
                    title: "Дюна: Часть вторая"
                },
                hall: {
                    id: 1,
                    name: "IMAX"
                }
            },
            {
                id: 2,
                movieId: 1,
                hallId: 1,
                date: date,
                time: "14:30",
                price: 600,
                vipPrice: 900,
                bookedSeats: [
                    { row: 3, seat: 4 }
                ],
                movie: {
                    id: 1,
                    title: "Дюна: Часть вторая"
                },
                hall: {
                    id: 1,
                    name: "IMAX"
                }
            },
            {
                id: 3,
                movieId: 2,
                hallId: 2,
                date: date,
                time: "12:00",
                price: 450,
                vipPrice: 700,
                bookedSeats: [],
                movie: {
                    id: 2,
                    title: "Оппенгеймер"
                },
                hall: {
                    id: 2,
                    name: "Комфорт"
                }
            },
            {
                id: 4,
                movieId: 3,
                hallId: 3,
                date: date,
                time: "19:45",
                price: 550,
                vipPrice: 850,
                bookedSeats: [
                    { row: 4, seat: 9 },
                    { row: 4, seat: 10 }
                ],
                movie: {
                    id: 3,
                    title: "Миссия невыполнима"
                },
                hall: {
                    id: 3,
                    name: "Стандарт"
                }
            }
        ];
    }
    
    async getScreening(id) {
        const screenings = await this.getScreenings();
        return screenings.find(screening => screening.id === parseInt(id)) || null;
    }

    
    async createBooking(bookingData) {
        console.log('Создание бронирования:', bookingData);
        
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const code = 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
        
        const booking = {
            id: Date.now(),
            code: code,
            screeningId: bookingData.screeningId,
            customerInfo: bookingData.customerInfo,
            seats: bookingData.seats,
            totalPrice: bookingData.seats.reduce((sum, seat) => sum + seat.price, 0),
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        
        let bookings = JSON.parse(localStorage.getItem('cinema_bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('cinema_bookings', JSON.stringify(bookings));
        
        return booking;
    }
    
    async getBooking(code) {
        const bookings = JSON.parse(localStorage.getItem('cinema_bookings') || '[]');
        return bookings.find(booking => booking.code === code) || null;
    }
    
    async getBookings(date = null) {
        let bookings = JSON.parse(localStorage.getItem('cinema_bookings') || '[]');
        
        if (date) {
            
            bookings = bookings.filter(booking => {
                
                return true;
            });
        }
        
        return bookings;
    }

    
    
    async createMovie(movieData) {
        console.log('Создание фильма:', movieData);
        
        const movies = await this.getMovies();
        const newMovie = {
            ...movieData,
            id: movies.length + 1,
            rating: movieData.rating || 7.0
        };
        
        
        localStorage.setItem('cinema_movies', JSON.stringify([...movies, newMovie]));
        
        return newMovie;
    }
    
    async updateMovie(id, movieData) {
        console.log('Обновление фильма:', id, movieData);
        
        let movies = await this.getMovies();
        const index = movies.findIndex(m => m.id === parseInt(id));
        
        if (index !== -1) {
            movies[index] = { ...movies[index], ...movieData };
            localStorage.setItem('cinema_movies', JSON.stringify(movies));
            return movies[index];
        }
        
        throw new Error('Фильм не найден');
    }
    
    async deleteMovie(id) {
        console.log('Удаление фильма:', id);
        
        let movies = await this.getMovies();
        movies = movies.filter(m => m.id !== parseInt(id));
        localStorage.setItem('cinema_movies', JSON.stringify(movies));
        
        return { success: true };
    }
    
    async createHall(hallData) {
        console.log('Создание зала:', hallData);
        
        const halls = await this.getHalls();
        const newHall = {
            ...hallData,
            id: halls.length + 1,
            rows: parseInt(hallData.rows) || 10,
            seatsPerRow: parseInt(hallData.seatsPerRow) || 15
        };
        
        localStorage.setItem('cinema_halls', JSON.stringify([...halls, newHall]));
        return newHall;
    }
    
    async getDashboardStats() {
        const movies = await this.getMovies();
        const halls = await this.getHalls();
        const bookings = await this.getBookings();
        
        return {
            totalMovies: movies.length,
            totalHalls: halls.length,
            todayBookings: bookings.length,
            totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
        };
    }

    
    getAuthHeaders() {
        const token = localStorage.getItem('cinema_admin_token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    async handleAuthError(response) {
        
        return response;
    }
}



const cinemaAPI = new CinemaAPI();


if (typeof window !== 'undefined') {
    window.cinemaAPI = cinemaAPI;
}


console.log('CinemaAPI загружен (демо-режим)');