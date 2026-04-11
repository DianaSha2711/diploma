// Глобальное состояние приложения
let state = {
    halls: [],
    films: [],
    selectedConfigHall: null,
    selectedPriceHall: null,
    selectedSalesHall: null,
    seatingConfig: []
};

document.addEventListener('DOMContentLoaded', async () => {

    await loadInitialData();
    state.selectedConfigHall = state.halls[0].id;

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
    const btnHallConfigSave = document.getElementById('hall_config_save');
    btnHallConfigSave.onclick = async () => {
        try {
            console.log('🔄 Сохранение конфигурации зала...');

            const hallData = cinemaAPI.getHall(state.selectedConfigHall);
            const formData = new FormData();
            formData.append('hallId', hallData.id);
            formData.append('rowCount', hallData.hall_rows);
            formData.append('placeCount', hallData.hall_places);
            formData.append('config', JSON.stringify(state.seatingConfig));

            const result = await cinemaAPI.request('hall/' + hallData.id, 'POST', formData);
            hallData.hall_config = result.hall_config;
            generateSeatingChart(hallData)
            console.log('✅ Конфигурация зала сохранена:', result);

        } catch (error) {
            console.error('❌ Ошибка бронирования:', error);
            showNotification('Ошибка бронирования' + (error && error.message) ? ': ' + error.message : '', 'danger');
        }
    }
    const domRowsInput = document.getElementById('rows-count');
    domRowsInput.oninput = () => {
        const hallData = cinemaAPI.getHall(state.selectedConfigHall);
        hallData.hall_rows = domRowsInput.value;
        generateSeatingChart(hallData);
    }
    const domColsInput = document.getElementById('cols-count');
    domColsInput.oninput = () => {
        const hallData = cinemaAPI.getHall(state.selectedConfigHall);
        hallData.hall_places = domColsInput.value;
        generateSeatingChart(hallData);
    }
    loadHallConfig(state.halls[0].id);
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
            <button class="delete-hall btn" id="${hall.id}"><img src='img/trash.png'></button>
        `;
        container.appendChild(hallDiv);
    });

    // Добавляем обработчики на кнопки удаления
    document.querySelectorAll('.delete-hall').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const hallId = btn.id;
            deleteHall(hallId);
        });
    });
}

function deleteHall(hallId) {
    state.halls = state.halls.filter(h => h.id != hallId);
    renderHallsManagement();
    renderHallTabs(); // Обновляем табы во всех секциях
}

async function addHall() {
    const sHallName = prompt('Введите название зала');
    if (!sHallName) {
        alert("Имя зала не может быть пустым");
    }
    const newId = Math.max(...state.halls.map(h => h.id), 0) + 1;
    try {
        const formData = new FormData();
        formData.append('hallName', sHallName);
        const result = await cinemaAPI.request('hall', 'POST', formData);
        console.log('✅ Зал добавлен:', result);
        state.halls = result.halls;
        renderHallsManagement();
        renderHallTabs();
        renderTimelines();
    } catch { }
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

function selectHall(type, hall) {
    const hallId = typeof hall === 'object' ? hall.id : hall;

    if (type === 'config') {
        state.selectedConfigHall = hallId;
        renderHallTabs();
        loadHallConfig(hallId);
    } else if (type === 'prices') {
        state.selectedPriceHall = hallId;
        renderHallTabs();
        loadHallPrices(hallId);
    } else if (type === 'sales') {
        state.selectedSalesHall = hallId;
        renderHallTabs();
    }
}

async function loadHallConfig(hallId) {
    try {
        const hallData = cinemaAPI.getHall(hallId);
        // Здесь должна быть логика отображения схемы зала
        generateSeatingChart(hallData);
        const domRowsInput = document.getElementById('rows-count');
        domRowsInput.value = hallData.hall_rows
        const domColsInput = document.getElementById('cols-count');
        domColsInput.value = hallData.hall_places
    } catch (error) {
        console.error('Ошибка загрузки конфигурации зала:', error);
        // Заглушка
        generateSeatingChart({ rows: 5, cols: 5, seats: [] });
    }
}

function generateSeatingChart(hallData) {
    const chart = document.getElementById('seating-chart');
    const rows = hallData.hall_rows || 5;
    const cols = hallData.hall_places || 5;

    chart.innerHTML = '';
    state.seatingConfig = [];
    for (let r = 0; r < rows; r++) {
        const row = document.createElement('div');
        row.className = 'seat_row';
        state.seatingConfig.push([]);
        for (let c = 0; c < cols; c++) {
            const seat = document.createElement('div');
            seat.className = 'seat' + ((hallData.hall_config[r][c] == "vip") ? " vip" : (hallData.hall_config[r][c] == "disabled") ? " disabled" : "");
            seat.addEventListener('click', () => toggleSeatType(seat, r, c));
            row.appendChild(seat);
            state.seatingConfig[r][c] = hallData.hall_config[r][c];
        }
        chart.appendChild(row);
    }
}

function toggleSeatType(seatElement, r, c) {
    if (seatElement.classList.contains('vip')) {
        seatElement.classList.remove('vip');
        seatElement.classList.add('disabled');
        state.seatingConfig[r][c] = "disabled";
    } else if (seatElement.classList.contains('disabled')) {
        seatElement.classList.remove('disabled');
        state.seatingConfig[r][c] = "standart";
    } else {
        state.seatingConfig[r][c] = "vip";
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
    const nFilmLenght = filmData.duration / (60 * 24) * rect.width;
    filmBlock.className = 'time-slot-film';
    filmBlock.style.backgroundColor = filmData.color;
    filmBlock.style.width = `${filmData.duration * 2}px`;
    filmBlock.textContent = filmData.name;
    filmBlock.style.left = nOffset + 'px';
    filmBlock.style.maxWidth = nFilmLenght + 'px';
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

        });
    });

    // Кнопка открытия продаж
    document.getElementById('open-sales_btn').addEventListener('click', openSales);
}


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