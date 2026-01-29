
let currentEditingMovieId = null;
let currentEditingHallId = null;
let currentEditingScreeningId = null;

document.addEventListener('DOMContentLoaded', async function() {
    
    const token = localStorage.getItem('cinema_admin_token');
    const userStr = localStorage.getItem('cinema_admin_user');
    
    if (!token || !userStr) {
       
        window.location.href = 'login.html';
        return;
    }
    
    try {
      
        const isValid = await cinemaAPI.validateSession();
        if (!isValid) {
            localStorage.removeItem('cinema_admin_token');
            localStorage.removeItem('cinema_admin_user');
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.warn('Ошибка проверки сессии:', error);
        
    }
    
    
    displayUserInfo();
    
    
    await initAdminPanel();
    
    
    
    async function initAdminPanel() {
        
        await loadDashboardStats();
        
        
        initNavigation();
        
        
        initModals();
        
        
        await loadSectionData('dashboard');
    }
    
    
    function displayUserInfo() {
        try {
            const user = JSON.parse(localStorage.getItem('cinema_admin_user'));
            
            
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                            type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-2"></i>
                        <span>${user.name || user.username}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <div class="dropdown-header">
                                <small>Вы вошли как</small><br>
                                <strong>${user.name || user.username}</strong>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item" href="#" id="logoutBtn">
                                <i class="fas fa-sign-out-alt me-2"></i> Выйти
                            </a>
                        </li>
                    </ul>
                </div>
            `;
            
            
            const sidebar = document.querySelector('.sidebar');
            sidebar.appendChild(userInfo);
            
            
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                
                
                cinemaAPI.logout();
                
                
                localStorage.removeItem('cinema_admin_token');
                localStorage.removeItem('cinema_admin_user');
                
                
                window.location.href = 'login.html';
            });
            
        } catch (error) {
            console.error('Ошибка отображения информации о пользователе:', error);
        }
    }
    
    
    
    function initNavigation() {
        
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                
                document.querySelectorAll('.sidebar .nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                
                
                this.classList.add('active');
                
                
                const sectionId = this.getAttribute('href').substring(1);
                showSection(sectionId);
            });
        });
    }
    
    function showSection(sectionId) {
        
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        
        
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            
            
            loadSectionData(sectionId);
        }
    }
    
    
    async function loadSectionData(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                await loadDashboardStats();
                break;
            case 'movies':
                await loadMovies();
                break;
            case 'halls':
                await loadHalls();
                break;
            case 'screenings':
                await loadScreenings();
                break;
            case 'bookings':
                await loadBookings();
                break;
        }
    }
    
   
    
    async function loadDashboardStats() {
        try {
            
            const stats = await cinemaAPI.getDashboardStats();
            
            
            if (stats.totalMovies !== undefined) {
                document.getElementById('totalMovies').textContent = stats.totalMovies;
            }
            
            if (stats.totalHalls !== undefined) {
                document.getElementById('totalHalls').textContent = stats.totalHalls;
            }
            
            if (stats.todayBookings !== undefined) {
                document.getElementById('todayBookings').textContent = stats.todayBookings;
            }
            
            if (stats.totalRevenue !== undefined) {
                document.getElementById('totalRevenue').textContent = `${stats.totalRevenue} руб.`;
            }
            
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            
            
            document.getElementById('totalMovies').textContent = Math.floor(Math.random() * 20) + 5;
            document.getElementById('totalHalls').textContent = Math.floor(Math.random() * 5) + 2;
            document.getElementById('todayBookings').textContent = Math.floor(Math.random() * 50) + 10;
            document.getElementById('totalRevenue').textContent = `${(Math.random() * 50000 + 10000).toFixed(0)} руб.`;
        }
    }
    
    
    
    async function loadMovies() {
        try {
            const movies = await cinemaAPI.getMovies();
            displayMovies(movies);
        } catch (error) {
            console.error('Ошибка загрузки фильмов:', error);
            showErrorMessage('moviesTable', 'Ошибка загрузки фильмов');
        }
    }
    
    function displayMovies(movies) {
        const tableBody = document.getElementById('moviesTable');
        
        if (movies.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <p class="text-muted">Фильмы не найдены</p>
                        <button class="btn btn-sm btn-primary" id="addMovieBtnEmpty">
                            <i class="fas fa-plus"></i> Добавить первый фильм
                        </button>
                    </td>
                </tr>
            `;
            
            document.getElementById('addMovieBtnEmpty').addEventListener('click', () => {
                showMovieModal();
            });
            
            return;
        }
        
        tableBody.innerHTML = '';
        
        movies.forEach(movie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${movie.poster || 'https://via.placeholder.com/50x75?text=No+Poster'}" 
                         alt="${movie.title}" 
                         class="movie-poster-small rounded">
                </td>
                <td>
                    <strong>${movie.title}</strong><br>
                    <small class="text-muted">${movie.genre || 'Не указан'}</small>
                </td>
                <td>${movie.duration || 0} мин.</td>
                <td>
                    <span class="badge ${movie.rating >= 8 ? 'bg-success' : movie.rating >= 6 ? 'bg-warning' : 'bg-secondary'}">
                        ${movie.rating || 'N/A'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-warning edit-movie" 
                                data-id="${movie.id}"
                                title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-movie" 
                                data-id="${movie.id}"
                                title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        
        attachMovieEventListeners();
    }
    
    function attachMovieEventListeners() {
        
        document.getElementById('addMovieBtn').addEventListener('click', () => {
            showMovieModal();
        });
        
        
        document.querySelectorAll('.edit-movie').forEach(button => {
            button.addEventListener('click', async (e) => {
                const movieId = e.currentTarget.dataset.id;
                await editMovie(movieId);
            });
        });
        
        
        document.querySelectorAll('.delete-movie').forEach(button => {
            button.addEventListener('click', async (e) => {
                const movieId = e.currentTarget.dataset.id;
                const movieTitle = e.currentTarget.closest('tr').querySelector('td:nth-child(2) strong').textContent;
                
                if (confirm(`Удалить фильм "${movieTitle}"?`)) {
                    await deleteMovie(movieId);
                }
            });
        });
    }
    
    function showMovieModal(movie = null) {
        const modal = new bootstrap.Modal(document.getElementById('movieModal'));
        const form = document.getElementById('movieForm');
        
        form.reset();
        
        if (movie) {
            
            document.getElementById('modalTitle').textContent = 'Редактировать фильм';
            document.getElementById('saveMovieBtn').textContent = 'Сохранить изменения';
            
            
            form.querySelector('[name="title"]').value = movie.title || '';
            form.querySelector('[name="description"]').value = movie.description || '';
            form.querySelector('[name="genre"]').value = movie.genre || '';
            form.querySelector('[name="duration"]').value = movie.duration || '';
            form.querySelector('[name="poster"]').value = movie.poster || '';
            form.querySelector('[name="rating"]').value = movie.rating || '';
            
            currentEditingMovieId = movie.id;
        } else {
            
            document.getElementById('modalTitle').textContent = 'Добавить фильм';
            document.getElementById('saveMovieBtn').textContent = 'Добавить фильм';
            currentEditingMovieId = null;
        }
        
        modal.show();
    }
    
    async function editMovie(movieId) {
        try {
            const movie = await cinemaAPI.getMovie(movieId);
            showMovieModal(movie);
        } catch (error) {
            console.error('Ошибка загрузки фильма:', error);
            showToast('Ошибка загрузки фильма', 'danger');
        }
    }
    
    async function deleteMovie(movieId) {
        try {
            await cinemaAPI.deleteMovie(movieId);
            await loadMovies();
            showToast('Фильм успешно удален', 'success');
        } catch (error) {
            console.error('Ошибка удаления фильма:', error);
            showToast('Ошибка удаления фильма', 'danger');
        }
    }
    
    
    document.getElementById('saveMovieBtn').addEventListener('click', async () => {
        const form = document.getElementById('movieForm');
        const formData = new FormData(form);
        
        const movieData = {
            title: formData.get('title'),
            description: formData.get('description'),
            genre: formData.get('genre'),
            duration: parseInt(formData.get('duration')) || 0,
            poster: formData.get('poster') || null,
            rating: parseFloat(formData.get('rating')) || null
        };
        
        try {
            if (currentEditingMovieId) {
                
                await cinemaAPI.updateMovie(currentEditingMovieId, movieData);
                showToast('Фильм успешно обновлен', 'success');
            } else {
                
                await cinemaAPI.createMovie(movieData);
                showToast('Фильм успешно добавлен', 'success');
            }
            
            
            bootstrap.Modal.getInstance(document.getElementById('movieModal')).hide();
            
            
            await loadMovies();
            
        } catch (error) {
            console.error('Ошибка сохранения фильма:', error);
            showToast(error.message || 'Ошибка сохранения фильма', 'danger');
        }
    });
    
    
    
    async function loadHalls() {
        try {
            const halls = await cinemaAPI.getHalls();
            displayHalls(halls);
        } catch (error) {
            console.error('Ошибка загрузки залов:', error);
            showErrorMessage('hallsList', 'Ошибка загрузки залов');
        }
    }
    
    function displayHalls(halls) {
        const hallsList = document.getElementById('hallsList');
        
        if (halls.length === 0) {
            hallsList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <p class="mb-0">Залы не найдены</p>
                    </div>
                    <button class="btn btn-primary" id="addHallBtnEmpty">
                        <i class="fas fa-plus"></i> Добавить первый зал
                    </button>
                </div>
            `;
            
            document.getElementById('addHallBtnEmpty').addEventListener('click', () => {
                showHallModal();
            });
            
            return;
        }
        
        hallsList.innerHTML = '';
        
        halls.forEach(hall => {
            const hallCard = document.createElement('div');
            hallCard.className = 'col-md-6 col-lg-4 mb-4';
            hallCard.innerHTML = `
                <div class="card hall-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${hall.name}</h5>
                        <p class="card-text">
                            <i class="fas fa-th me-2"></i>
                            <strong>${hall.rows} × ${hall.seatsPerRow}</strong> мест<br>
                            <i class="fas fa-crown me-2"></i>
                            VIP ряды: <strong>${hall.vipRows?.join(', ') || 'нет'}</strong><br>
                            <i class="fas fa-wifi me-2"></i>
                            ${hall.has3D ? '3D' : '2D'}
                        </p>
                        <p class="card-text text-muted small">
                            ${hall.description || 'Нет описания'}
                        </p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="btn-group w-100">
                            <button class="btn btn-outline-warning edit-hall" 
                                    data-id="${hall.id}">
                                <i class="fas fa-edit"></i> Редактировать
                            </button>
                            <button class="btn btn-outline-danger delete-hall" 
                                    data-id="${hall.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            hallsList.appendChild(hallCard);
        });
        
        
        attachHallEventListeners();
    }
    
    function attachHallEventListeners() {
        
        document.getElementById('addHallBtn').addEventListener('click', () => {
            showHallModal();
        });
        
        
        document.getElementById('hallsList').addEventListener('click', async (e) => {
            if (e.target.closest('.edit-hall')) {
                const hallId = e.target.closest('.edit-hall').dataset.id;
                await editHall(hallId);
            }
            
            if (e.target.closest('.delete-hall')) {
                const hallId = e.target.closest('.delete-hall').dataset.id;
                const hallName = e.target.closest('.hall-card').querySelector('.card-title').textContent;
                
                if (confirm(`Удалить зал "${hallName}"?`)) {
                    await deleteHall(hallId);
                }
            }
        });
    }
    
    
    
    async function loadScreenings() {
        try {
            
            const today = new Date().toISOString().split('T')[0];
            const screenings = await cinemaAPI.getScreenings(today);
            displayScreenings(screenings);
        } catch (error) {
            console.error('Ошибка загрузки сеансов:', error);
            showErrorMessage('screeningsTable', 'Ошибка загрузки сеансов');
        }
    }
    
    function displayScreenings(screenings) {
        const tableBody = document.getElementById('screeningsTable');
        
        if (!screenings || screenings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <p class="text-muted">Сеансы не найдены</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        screenings.forEach(screening => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${screening.movie?.title || 'Неизвестный фильм'}</td>
                <td>${screening.hall?.name || 'Неизвестный зал'}</td>
                <td>${screening.date}</td>
                <td>${screening.time}</td>
                <td>
                    <span class="badge bg-info">
                        ${screening.price} руб.${screening.vipPrice ? ` (VIP: ${screening.vipPrice} руб.)` : ''}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-warning edit-screening" 
                                data-id="${screening.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-screening" 
                                data-id="${screening.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        attachScreeningEventListeners();
    }
    
    
    
    async function loadBookings() {
        try {
            const bookings = await cinemaAPI.getBookings();
            displayBookings(bookings);
        } catch (error) {
            console.error('Ошибка загрузки бронирований:', error);
            showErrorMessage('bookingsTable', 'Ошибка загрузки бронирований');
        }
    }
    
    function displayBookings(bookings) {
        const tableBody = document.getElementById('bookingsTable');
        
        if (!bookings || bookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <p class="text-muted">Бронирования не найдены</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <code>${booking.code}</code><br>
                    <small class="text-muted">${new Date(booking.createdAt).toLocaleString()}</small>
                </td>
                <td>
                    <strong>${booking.screening?.movie?.title || 'Неизвестный фильм'}</strong><br>
                    <small>${booking.screening?.date} ${booking.screening?.time}</small>
                </td>
                <td>${booking.seats?.map(s => `${s.row}-${s.seat}`).join(', ') || '—'}</td>
                <td>
                    <strong>${booking.customerInfo?.name || 'Не указано'}</strong><br>
                    <small>${booking.customerInfo?.phone || ''}</small>
                </td>
                <td><strong>${booking.totalPrice} руб.</strong></td>
                <td>
                    <span class="badge ${getStatusBadgeClass(booking.status)}">
                        ${getStatusText(booking.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info view-booking" 
                                data-code="${booking.code}">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${booking.status === 'confirmed' ? `
                            <button class="btn btn-outline-warning cancel-booking" 
                                    data-code="${booking.code}">
                                <i class="fas fa-ban"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        attachBookingEventListeners();
    }
    
    
    
    function initModals() {
       
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    bootstrap.Modal.getInstance(modal).hide();
                }
            });
        });
    }
    
    function showToast(message, type = 'info') {
        
        const toastContainer = document.getElementById('toastContainer') || createToastContainer();
        
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type}`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        
        bsToast.show();
        
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1060';
        document.body.appendChild(container);
        return container;
    }
    
    function showErrorMessage(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            `;
        }
    }
    
    function getStatusBadgeClass(status) {
        switch(status) {
            case 'confirmed': return 'bg-success';
            case 'pending': return 'bg-warning';
            case 'cancelled': return 'bg-danger';
            case 'completed': return 'bg-info';
            default: return 'bg-secondary';
        }
    }
    
    function getStatusText(status) {
        const statusMap = {
            'confirmed': 'Подтверждено',
            'pending': 'Ожидание',
            'cancelled': 'Отменено',
            'completed': 'Завершено'
        };
        return statusMap[status] || status;
    }
    
    
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'admin.html') {
           
            const token = localStorage.getItem('cinema_admin_token');
            if (!token) {
                e.preventDefault();
                window.location.href = 'login.html';
            }
        }
    });
    
    
    setInterval(async () => {
        try {
            const isValid = await cinemaAPI.validateSession();
            if (!isValid) {
                showToast('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
                setTimeout(() => {
                    localStorage.removeItem('cinema_admin_token');
                    localStorage.removeItem('cinema_admin_user');
                    window.location.href = 'login.html';
                }, 5000);
            }
        } catch (error) {
           
        }
    }, 5 * 60 * 1000); 
    
});


function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}


function formatTime(time) {
    return time.substring(0, 5); 
}


function generateBookingCode() {
    return 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
}


function validateForm(formData, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData.get(field);
        
        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`Поле "${rule.label}" обязательно для заполнения`);
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
            errors.push(`Поле "${rule.label}" должно содержать минимум ${rule.minLength} символов`);
        }
        
        if (rule.type === 'number' && value && isNaN(parseFloat(value))) {
            errors.push(`Поле "${rule.label}" должно быть числом`);
        }
        
        if (rule.type === 'email' && value && !validateEmail(value)) {
            errors.push(`Поле "${rule.label}" должно содержать валидный email`);
        }
    }
    
    return errors;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}


if (typeof window !== 'undefined') {
    window.adminUtils = {
        formatDate,
        formatTime,
        generateBookingCode,
        validateForm,
        validateEmail,
        setupImagePreview
    };
}