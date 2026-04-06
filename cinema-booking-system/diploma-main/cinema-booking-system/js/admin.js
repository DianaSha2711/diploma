// Глобальное состояние приложения
let state = {
    halls: [],
    films: [],
    selectedConfigHall: null,
    selectedPriceHall: null,
    selectedSalesHall: null,
    seatingConfig: [] // Для хранения временной схемы зала
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем все данные с сервера
    await loadInitialData();

    // Рендерим все секции
    renderHallsManagement();
    renderHallTabs();
    renderFilmsList();
    renderTimelines();

    // Назначаем обработчики событий
    setupEventListeners();

    for (let i = 1; i < 6; i++) {
        const sBlockname = "section" + i + "contain";
        const sCTRL = "section" + i + "ctrl";
        const domSection1ctrl = document.getElementById(sCTRL);
        const domSection1cont = document.getElementById(sBlockname);
        if (domSection1cont && domSection1ctrl) {
            domSection1ctrl.onclick = () => {
                if (domSection1cont.style.display == "none") {
                    domSection1ctrl.src = "img/chevron-down.svg";
                    domSection1cont.style.display = "";
                } else {
                    domSection1cont.style.display = "none";
                    domSection1ctrl.src = "img/chevron-right.svg"
                }
            }
        }
    }

});

// Функция загрузки начальных данных
async function loadInitialData() {
    try {
        // Получаем все данные одним запросом, как в ТЗ
        const allData = await cinemaAPI.getAllData();
        // Предполагаем, что в allData есть поля halls и films
        state.halls = allData.halls || await cinemaAPI.getHalls();
        state.films = allData.films || await cinemaAPI.getFilms();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Заглушки на случай ошибки API
        state.halls = state.halls.length ? state.halls : [{ id: 1, name: 'Зал 1' }];
        state.films = state.films.length ? state.films : [{ id: 1, name: 'Пример фильма', duration: 120, poster: '', country: 'РФ' }];
    }
}

// 1. Управление залами
function renderHallsManagement() {
    const container = document.getElementById('halls-list');
    container.innerHTML = '';

    state.halls.forEach(hall => {
        const hallDiv = document.createElement('div');
        hallDiv.className = 'hall-item';
        hallDiv.innerHTML = `
            <span>– ${hall.hall_name}</span>
            <button class="delete-hall btn" data-id="${hall.id}"><img src='img/trash.png'></button>
        `;
        container.appendChild(hallDiv);
    });

    // Добавляем обработчики на кнопки удаления
    document.querySelectorAll('.delete-hall').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const hallId = e.target.dataset.id;
            deleteHall(hallId);
        });
    });
}

function deleteHall(hallId) {
    state.halls = state.halls.filter(h => h.id != hallId);
    renderHallsManagement();
    renderHallTabs(); // Обновляем табы во всех секциях
}

function addHall() {
    const newId = Math.max(...state.halls.map(h => h.id), 0) + 1;
    const newHall = { id: newId, name: `Зал ${newId}` };
    state.halls.push(newHall);
    renderHallsManagement();
    renderHallTabs();
}

// 2. Конфигурация залов (табы и схема)
function renderHallTabs() {
    renderTabs('config-hall-tabs', 'config', (hall) => selectHall('config', hall.id));
    renderTabs('prices-hall-tabs', 'prices', (hall) => selectHall('prices', hall.id));
    renderTabs('sales-hall-tabs', 'sales', (hall) => selectHall('sales', hall.id));
}

function renderTabs(containerId, type, onClick) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    state.halls.forEach(hall => {
        const btn = document.createElement('button');
        btn.className = 'hall-tab';
        if ((type === 'config' && state.selectedConfigHall === hall.id) ||
            (type === 'prices' && state.selectedPriceHall === hall.id) ||
            (type === 'sales' && state.selectedSalesHall === hall.id)) {
            btn.classList.add('active');
        }
        btn.textContent = hall.hall_name;
        btn.addEventListener('click', () => onClick(hall));
        container.appendChild(btn);
    });
}

async function selectHall(type, hall) {
    const hallId = typeof hall === 'object' ? hall.id : hall;

    if (type === 'config') {
        state.selectedConfigHall = hallId;
        renderHallTabs();
        await loadHallConfig(hallId);
    } else if (type === 'prices') {
        state.selectedPriceHall = hallId;
        renderHallTabs();
        await loadHallPrices(hallId);
    } else if (type === 'sales') {
        state.selectedSalesHall = hallId;
        renderHallTabs();
    }
}

async function loadHallConfig(hallId) {
    try {
        const hallData = await cinemaAPI.getHall(hallId);
        // Здесь должна быть логика отображения схемы зала
        generateSeatingChart(hallData);
    } catch (error) {
        console.error('Ошибка загрузки конфигурации зала:', error);
        // Заглушка
        generateSeatingChart({ rows: 5, cols: 5, seats: [] });
    }
}

function generateSeatingChart(hallData) {
    const chart = document.getElementById('seating-chart');
    const rows = hallData.rows || 5;
    const cols = hallData.cols || 5;

    chart.innerHTML = '';
    for (let r = 0; r < rows; r++) {
        const row = document.createElement('div');
        row.className = 'seat_row';
        for (let c = 0; c < cols; c++) {
            const seat = document.createElement('div');
            seat.className = 'seat'; // По умолчанию обычное
            // Здесь можно добавить логику определения типа из hallData.seats
            seat.addEventListener('click', () => toggleSeatType(seat));
            row.appendChild(seat);
        }
        chart.appendChild(row);
    }
}

function toggleSeatType(seatElement) {
    if (seatElement.classList.contains('vip')) {
        seatElement.classList.remove('vip');
        seatElement.classList.add('disabled');
    } else if (seatElement.classList.contains('disabled')) {
        seatElement.classList.remove('disabled');
    } else {
        seatElement.classList.add('vip');
    }
}

async function loadHallPrices(hallId) {
    try {
        const hallData = await cinemaAPI.getHall(hallId);
        document.getElementById('price-regular').value = hallData.priceRegular || 0;
        document.getElementById('price-vip').value = hallData.priceVip || 0;
    } catch (error) {
        console.error('Ошибка загрузки цен:', error);
    }
}

// 3. Фильмы и сетка сеансов
function renderFilmsList() {
    const container = document.getElementById('films-list');
    container.innerHTML = '';

    // Цвета для фильмов
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];


    state.films.forEach((film, index) => {
        const filmEl = document.createElement('div');
        filmEl.className = 'film_tag';
        filmEl.style.backgroundColor = colors[index % colors.length];
        filmEl.draggable = true;
        filmEl.dataset.filmId = film.id;
        filmEl.dataset.duration = film.duration;

        filmEl.innerHTML = `
            <img src="${film.film_poster || 'https://via.placeholder.com/30x40'}" alt="${film.film_name}">
            <span>${film.film_name} (${film.film_duration} мин)</span>
            <button class="trash btn delete-hall"></button>
        `;

        // Drag & Drop
        filmEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                id: film.id,
                name: film.film_name,
                duration: film.film_duration,
                color: colors[index % colors.length]
            }));
        });

        container.appendChild(filmEl);
    });
}

function renderTimelines() {
    const container = document.getElementById('timelines');
    container.innerHTML = '';

    state.halls.forEach(hall => {
        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'timeline';
        timelineDiv.innerHTML = `
            <h4>${hall.hall_name}</h4>
            <div class="time-slots" data-hall-id="${hall.id}"></div>
            <div class="time-scale">
                <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
            </div> <div class="time-scale">
                <span>0:00</span><span>6:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
        `;

        // Обработчик drop для таймлинии
        const slots = timelineDiv.querySelector('.time-slots');
        slots.addEventListener('dragover', (e) => e.preventDefault());
        slots.addEventListener('drop', (e) => {
            e.preventDefault();
            const filmData = JSON.parse(e.dataTransfer.getData('text/plain'));
            addFilmToTimeline(slots, filmData, e);
        });

        container.appendChild(timelineDiv);
    });
}

function addFilmToTimeline(container, filmData, e) {
    const rect = container.getBoundingClientRect();
    const nOffset = (e.x - rect.x);
    const filmBlock = document.createElement('div');
    const nFilmLenght = filmData.duration/(60*24)*rect.width;
    filmBlock.className = 'time-slot-film';
    filmBlock.style.backgroundColor = filmData.color;
    filmBlock.style.width = `${filmData.duration * 2}px`;
    filmBlock.textContent = filmData.name;
    filmBlock.style.left = nOffset+'px'; 
    filmBlock.style.maxWidth = nFilmLenght+'px'; 
    filmBlock.title = filmData.name; 

    filmBlock.addEventListener('click', () => {
        const newTime = prompt('Введите время начала (например, 14:30):', '12:00');
        if (newTime) {
            filmBlock.style.left = '200px'; 
        }
    });

    container.appendChild(filmBlock);
}

// 4. Форма добавления фильма
function showAddFilmForm() {
    document.getElementById('film-form').classList.remove('hidden');
}

function hideAddFilmForm() {
    document.getElementById('film-form').classList.add('hidden');
}

function addNewFilm() {
    const name = document.getElementById('film-name').value;
    const poster = document.getElementById('film-poster').value;
    const duration = document.getElementById('film-duration').value;
    const country = document.getElementById('film-country').value;

    if (name && duration) {
        const newFilm = {
            id: Date.now(),
            name,
            poster: poster || 'https://via.placeholder.com/30x40',
            duration: parseInt(duration),
            country
        };
        state.films.push(newFilm);
        renderFilmsList();
        hideAddFilmForm();

        // Очищаем поля
        document.getElementById('film-name').value = '';
        document.getElementById('film-poster').value = '';
        document.getElementById('film-duration').value = '';
        document.getElementById('film-country').value = '';
    } else {
        alert('Заполните обязательные поля');
    }
}

// 5. Открытие продаж
function openSales() {
    if (!state.selectedSalesHall) {
        alert('Выберите зал');
        return;
    }
    alert(`Продажи открыты для зала ID: ${state.selectedSalesHall}`);
    // Здесь должен быть вызов API
    // cinemaAPI.openSales(state.selectedSalesHall);
}

// Настройка всех обработчиков событий
function setupEventListeners() {
    // Добавление зала
    document.getElementById('add-hall_btn').addEventListener('click', addHall);

    // Форма добавления фильма
    document.getElementById('add-film_btn').addEventListener('click', showAddFilmForm);
    document.getElementById('submit-film').addEventListener('click', addNewFilm);
    document.getElementById('cancel-film').addEventListener('click', hideAddFilmForm);

    // Кнопки Отмена (просто сбрасываем)
    document.querySelectorAll('.cancel_btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Отмена изменений');
            loadInitialData(); // Перезагружаем исходные данные
        });
    });

    // Кнопки Сохранить (здесь должна быть логика отправки на API)
    document.querySelectorAll('.save_btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Сохранение изменений');
            // Здесь вызов API для сохранения
        });
    });

    // Кнопка открытия продаж
    document.getElementById('open-sales_btn').addEventListener('click', openSales);
}

// Для демонстрации создадим заглушку API, если её нет
if (typeof cinemaAPI === 'undefined') {
    window.cinemaAPI = {
        getAllData: async () => {
            return {
                halls: [
                    { id: 1, name: 'Красный зал', rows: 5, cols: 6 },
                    { id: 2, name: 'Синий зал', rows: 4, cols: 5 }
                ],
                films: [
                    { id: 1, name: 'Дюна 2', duration: 155, poster: '', country: 'США' },
                    { id: 2, name: 'Матрица', duration: 136, poster: '', country: 'США' }
                ]
            };
        },
        getHalls: async () => {
            return [
                { id: 1, name: 'Красный зал', rows: 5, cols: 6 },
                { id: 2, name: 'Синий зал', rows: 4, cols: 5 }
            ];
        },
        getFilms: async () => {
            return [
                { id: 1, name: 'Дюна 2', duration: 155, poster: '', country: 'США' },
                { id: 2, name: 'Матрица', duration: 136, poster: '', country: 'США' }
            ];
        },
        getHall: async (id) => {
            return { id, name: `Зал ${id}`, rows: 5, cols: 6, priceRegular: 250, priceVip: 500 };
        }
    };
}