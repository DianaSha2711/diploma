document.addEventListener('DOMContentLoaded', async function () {
    console.log('🎬 Приложение загружено');

    try {

        initDateSelector();

        await cinemaAPI.getAllData();

        /*loadFilms();*/
        loadSeances();


        initBookingModal();

        console.log('✅ Все данные загружены');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        showNotification('Ошибка загрузки данных', 'danger');
    }
});



let currentDate = new Date();

function initDateSelector() {
    const dateScroll = document.getElementById('dateScroll');
    if (!dateScroll) return;

    dateScroll.innerHTML = '';


    for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const dateElement = document.createElement('div');
        dateElement.className = 'date-item';
        if (i === 0) dateElement.classList.add('active');

        dateElement.innerHTML = `
            <div class="date-day">${formatDay(date)}</div>
            <div class="date-number">${date.getDate()}</div>
            <div class="date-month">${formatMonth(date)}</div>
        `;

        dateElement.addEventListener('click', () => {
            document.querySelectorAll('.date-item').forEach(el => el.classList.remove('active'));
            dateElement.classList.add('active');
            currentDate = date;
            updateCurrentDateDisplay();
            loadSeances();
        });

        dateScroll.appendChild(dateElement);
    }

    updateCurrentDateDisplay();
}

function formatDay(date) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' }).slice(0, 3);
}

function formatMonth(date) {
    return date.toLocaleDateString('ru-RU', { month: 'short' }).slice(0, 3);
}

function updateCurrentDateDisplay() {
    const element = document.getElementById('currentDate');
    if (element) {
        element.textContent = currentDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}



function loadFilms() {
    try {
        console.log('🎬 Загрузка фильмов...');
        const films = cinemaAPI.getFilms();

        const filmList = document.getElementById('filmList');
        if (!filmList) return;

        if (!films || films.length === 0) {
            filmList.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Фильмы не найдены</p></div>';
            return;
        }

        filmList.innerHTML = '';

        films.forEach(film => {
            const card = createFilmCard(film);
            filmList.appendChild(card);
        });

        console.log(`✅ Загружено ${films.length} фильмов`);
    } catch (error) {
        console.error('❌ Ошибка загрузки фильмов:', error);
        showNotification('Ошибка загрузки фильмов', 'danger');
    }
}

function createFilmCard(film) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-3 mb-4';

    const poster = film.film_poster || 'img/title.svg';
    const rating = film.film_rating ? film.rating.toFixed(1) : '0.0';
    const duration = film.film_duration || 0; 'img/title.svg';
    const country = film.film_country || '';
    const description = film.film_description
        ? film.film_description.substring(0, 100) + (film.film_description.length > 100 ? '...' : '')
        : 'Описание отсутствует';

    col.innerHTML = `
        <div class="card film-card h-100">
            <img src="${poster}" 
                 class="card-img-top" 
                 alt="${film.film_title}"
                 onerror="this.src='img/title.svg'">
            <div class="card-body">
                <h5 class="film-title">${escapeHtml(film.film_title)}</h5>
                <div class="film-meta mb-2">
                    <span class="film-duration">
                        <i class="fas fa-clock"></i> ${duration} мин
                    </span>
                    ${country ? `<span class="film-country ms-2">
                        <i class="fas fa-globe"></i> ${escapeHtml(country)}
                    </span>` : ''}
                </div>
                <p class="film-description text-muted small">${escapeHtml(description)}</p>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="badge bg-warning text-dark">
                        <i class="fas fa-star"></i> ${rating}
                    </span>
                </div>
            </div>
        </div>
    `;

    return col;
}



function loadSeances() {
    try {
        console.log('🎫 Загрузка сеансов...');

        const dateStr = formatDateForAPI(currentDate);
        const seances = cinemaAPI.getSeances(dateStr);
        const aUniqSeances = [];
        for (const seance of seances) {
            const uniqSeance = aUniqSeances.find(it => it.filmId === seance.seance_filmid);
            if (!uniqSeance) {
                aUniqSeances.push({
                    filmId: seance.seance_filmid,
                    aTimes_halls: [{ time: seance.seance_time, hall: seance.seance_hallid, seanceId: seance.id }]
                })
            } else {
                uniqSeance.aTimes_halls.push({ time: seance.seance_time, hall: seance.seance_hallid, seanceId: seance.id })
            }
        }
        const seanceList = document.getElementById('seanceList');
        if (!seanceList) return;

        if (!seances || seances.length === 0) {
            seanceList.innerHTML = '<div class="col-12 text-center"><p class="text-muted">На этот день сеансов нет</p></div>';
            return;
        }

        seanceList.innerHTML = '';

        aUniqSeances.forEach(seance => {
            const card = createSeanceCard(seance);
            seanceList.appendChild(card);
        });

        console.log(`✅ Загружено ${seances.length} сеансов`);
    } catch (error) {
        console.error('❌ Ошибка загрузки сеансов:', error);
        showNotification('Ошибка загрузки сеансов', 'danger');
    }
}

function createSeanceCard(seance) {
    const col = document.createElement('div');
    col.className = 'seance_card';

    const filmId = seance.filmId;

    const films = cinemaAPI.getFilms();
    if (!films || films.length === 0) return;

    const film = films.find(it => it.id === filmId);
    let filmTitle = 'Неизвестный фильм';
    let poster = 'img/title.svg';
    let description = "";
    let duration = "";
    let origin = "";
    if (film) {
        poster = film.film_poster || 'img/title.svg';
        filmTitle = film.film_name;
        description = film.film_description;
        duration = film.film_duration;
        origin = film.film_origin;
    }

    const allHalls = cinemaAPI.getHalls();
    if (!allHalls || allHalls.length === 0) return;

    let sTimes = "";
    const aHalls = [];

    seance.aTimes_halls.forEach(time_hall => {
        const hall = aHalls.find(it => it.id === time_hall.hall);
        if (hall) {
            hall.aTimes.push({ seanse_time: time_hall.time, seanceId: time_hall.seanceId });
        } else {
            aHalls.push({ id: time_hall.hall, aData: [{ time: time_hall.time, seanceId: time_hall.seanceId }] });
        }
    });

    aHalls.forEach(hall => {
        const currHall = allHalls.find(it => it.id === hall.id);
        let hallName = 'Неизвестный зал';
        if (currHall) {
            hallName = currHall.hall_name;
        }
        sTimes += `<div class="seance-hall">${hallName}<br>`
        hall.aData.forEach(data => {
            sTimes += `<button class="seance-time" onclick="openBookingModal(${data.seanceId})">${data.time}</button>`
        })
        sTimes += `</div>`
    });

    col.innerHTML = `
        <div class="card1 seance-card">
            <div class="card-body">
                <div class="flex_gor">
                    <img src="${poster}" 
                        class="card_img_top" 
                        alt="${film.film_title}"
                        onerror="this.src='img/title.svg'">
                    <div class="justify-content-between align-items-start">
                        <h3 class="film_title">${escapeHtml(filmTitle)}</h3>
                        <div class="film_description">${escapeHtml(description)}</div>
                         <div class="film_description">${escapeHtml(duration)} минут ${escapeHtml(origin)}</div>
                     </div>
                </div>
                ${sTimes}
            </div>
        </div>
    `;

    /*const btn = col.querySelector('.book-btn');
    btn.addEventListener('click', () => openBookingModal(seance.id));*/

    return col;
}
let currentHall = null;
let currentSeance = null;
let selectedSeats = [];

function initBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    modal.addEventListener('hidden.bs.modal', function () {
        selectedSeats = [];
        currentSeance = null;
        currentHall = null;
    });
}

async function openBookingModal(seanceId) {
    try {
        console.log(`🎫 Открытие бронирования для сеанса ${seanceId}`);

        const currentSeance = await cinemaAPI.getSeance(seanceId);
        if (!currentSeance) throw new Error('Сеанс не найден. Обновите страницу (F5)');

        generateHallLayout(currentSeance);

        const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
        modal.show();
    } catch (error) {
        console.error('❌ Ошибка открытия бронирования:', error);
        showNotification('Ошибка загрузки данных: ' + error.message, 'danger');
    }
}

function generateHallLayout(currentSeance) {
    const currentHall = cinemaAPI.getHall(currentSeance.seance_hallid);
    if (!currentHall) throw new Error('Зал не найден');

    const container = document.getElementById('hallLayout');
    if (!container) return;

    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.textContent = 'ЭКРАН';
    container.appendChild(screen);


    for (let row = 1; row <= currentHall.hall_rows; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'seat-row';
        rowElement.dataset.row = row;


        const rowNumber = document.createElement('div');
        rowNumber.className = 'row-number';
        rowNumber.textContent = row;
        rowElement.appendChild(rowNumber);


        for (let seat = 1; seat <= currentHall.hall_places; seat++) {
            const seatElement = createSeatElement(row, seat, currentHall, currentSeance);
            rowElement.appendChild(seatElement);
        }

        container.appendChild(rowElement);
    }


    addHallLegend(container);
}

function createSeatElement(row, seat, currentHall, currentSeance) {
    const seatElement = document.createElement('div');
    seatElement.className = 'seat';
    seatElement.dataset.row = row;
    seatElement.dataset.seat = seat;
    seatElement.dataset.id = `${row}-${seat}`;
    seatElement.textContent = seat;


    const seatStatus = currentHall.hall_config[row - 1][seat - 1]
    if (seatStatus === 'taken') {
        seatElement.classList.add('taken');

    } else if (seatStatus === 'vip') {
        seatElement.classList.add('vip');
        seatElement.onclick = () => {
            if (seatElement.classList.contains('selected')) {
                seatElement.classList.replace('selected', 'vip');
            } else {
                seatElement.classList.replace('vip', 'selected');
            }
            updateSelectedSeatsDisplay();
        }
    } else if (seatStatus === 'disabled') {
        seatElement.classList.add('disabled');

    } else {
        seatElement.classList.add('available');
        seatElement.onclick = () => {
            if (seatElement.classList.contains('selected')) {
                seatElement.classList.replace('selected', 'available');
            } else {
                seatElement.classList.replace('available', 'selected');
            }
            updateSelectedSeatsDisplay();
        }
    }


    /* const isBooked = currentSeance?.booked_seats?.some(
         seat => seat.row === row && seat.seat === seat
     );
 
     if (isBooked) {
         seatElement.classList.add('booked');
         seatElement.classList.remove('available', 'vip');
     } else {
         seatElement.addEventListener('click', toggleSeat);
     }*/

    return seatElement;
}

function displaySeances() {
    try {
        const seances = window.allSeances || [];
        const films = window.allFilms || [];
        const halls = window.allHalls || [];

        console.log('🎫 Все сеансы с сервера:', seances);

        const dateStr = formatDateForAPI(currentDate);
        const filteredSeances = seances.filter(s => s.date === dateStr);

        console.log(`📅 Сеансы на дату ${dateStr}:`, filteredSeances);


        const seanceList = document.getElementById('seanceList');
        if (!seanceList) {
            console.error('❌ Элемент seanceList не найден! Проверьте index.html');
            return;
        }


        seanceList.innerHTML = '';


        if (!filteredSeances || filteredSeances.length === 0) {
            seanceList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="fas fa-info-circle me-2"></i>
                        На этот день сеансов нет
                    </div>
                </div>
            `;
            return;
        }


        filteredSeances.forEach(seance => {

            const film = films.find(m => m.id === seance.film_id) || {
                title: 'Неизвестный фильм',
                poster: null
            };

            const hall = halls.find(h => h.id === seance.hall_id) || {
                name: 'Неизвестный зал'
            };


            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';

            col.innerHTML = `
                <div class="card seance-card h-100">
                    <div class="row g-0">
                        <div class="col-4">
                            <img src="${film.poster || 'https://via.placeholder.com/150x200/2c3e50/ffffff?text=Кино'}" 
                                 class="img-fluid rounded-start h-100" 
                                 style="object-fit: cover;"
                                 alt="${film.title}"
                                 onerror="this.src='https://via.placeholder.com/150x200/2c3e50/ffffff?text=Кино'">
                        </div>
                        <div class="col-8">
                            <div class="card-body">
                                <h5 class="film-title">${escapeHtml(film.title)}</h5>
                                <div class="seance-info">
                                    <p class="mb-1">
                                        <i class="fas fa-video me-2"></i>
                                        <span class="seance-hall">${escapeHtml(hall.name)}</span>
                                    </p>
                                    <p class="mb-1">
                                        <i class="fas fa-clock me-2"></i>
                                        <span class="seance-time">${seance.time}</span>
                                    </p>
                                    <p class="mb-1">
                                        <i class="fas fa-calendar me-2"></i>
                                        ${seance.date}
                                    </p>
                                    <p class="mb-2">
                                        <i class="fas fa-ruble-sign me-2"></i>
                                        <strong>${seance.price} ₽</strong>
                                        ${seance.vip_price ?
                    `<span class="badge bg-warning text-dark ms-2">VIP: ${seance.vip_price} ₽</span>`
                    : ''}
                                    </p>
                                </div>
                                <button class="btn btn-primary w-100 book-btn" 
                                        data-seance-id="${seance.id}">
                                    <i class="fas fa-ticket-alt me-2"></i>Выбрать места
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            seanceList.appendChild(col);
        });


        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const seanceId = this.dataset.seanceId;
                console.log('🎫 Выбран сеанс ID:', seanceId);
                openBookingModal(seanceId);
            });
        });

        console.log(`✅ Отображено ${filteredSeances.length} сеансов`);

    } catch (error) {
        console.error('❌ Ошибка отображения сеансов:', error);

        const seanceList = document.getElementById('seanceList');
        if (seanceList) {
            seanceList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Ошибка загрузки сеансов: ${error.message}
                    </div>
                </div>
            `;
        }
    }
}

function addHallLegend(container) {
    const legend = document.createElement('div');
    legend.className = 'hall-legend';
    legend.innerHTML = `
        <div class="legend-item">
            <div class="seat available" style="width:20px;height:20px;"></div>
            <span>Стандарт</span>
        </div>
        <div class="legend-item">
            <div class="seat vip" style="width:20px;height:20px;"></div>
            <span>VIP</span>
        </div>
        <div class="legend-item">
            <div class="seat selected" style="width:20px;height:20px;"></div>
            <span>Выбрано</span>
        </div>
        <div class="legend-item">
            <div class="seat booked" style="width:20px;height:20px;"></div>
            <span>Занято</span>
        </div>
    `;
    container.appendChild(legend);
}

function toggleSeat(e) {
    const seat = e.currentTarget;

    if (seat.classList.contains('selected')) {

        seat.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s =>
            !(s.row === parseInt(seat.dataset.row) && s.seat === parseInt(seat.dataset.seat))
        );
    } else {

        seat.classList.add('selected');
        selectedSeats.push({
            row: parseInt(seat.dataset.row),
            seat: parseInt(seat.dataset.seat),
            price: parseInt(seat.dataset.price),
            isVIP: seat.classList.contains('vip')
        });
    }

    updateSelectedSeatsDisplay();
}

function updateSelectedSeatsDisplay() {
    const container = document.getElementById('selectedSeats');
    const totalElement = document.getElementById('totalPrice');
    const confirmBtn = document.getElementById('confirmBooking');
    const domSelectedSeats = document.getElementsByClassName('selected');
    if (!container || !totalElement) return;
//<div class="seat selected" data-row="1" data-seat="4" data-id="1-4">4</div>//

    if (domSelectedSeats.length === 0) {
        container.innerHTML = '<p class="text-muted">Места не выбраны</p>';
        totalElement.textContent = '0';
        if (confirmBtn) confirmBtn.disabled = true;
        return;
    }

    let total = 0;
    let seatsHtml = '<div class="selected-seats-list">';

   /* selectedSeats.sort((a, b) => {
        if (a.row === b.row) return a.seat - b.seat;
        return a.row - b.row;
    });*/

    domSelectedSeats.forEach(seat => {
        seatsHtml += `
            <div class="selected-seat-item">
                Ряд ${seat['data-row']}, Место ${seat['data-seat']} 
                ${seat.classList.contains('vip')? '<span class="badge bg-warning text-dark">VIP</span>' : ''}
                - ${0} ₽
            </div>
        `;
        //total += seat.price;
    });

    seatsHtml += '</div>';
    container.innerHTML = seatsHtml;
    totalElement.textContent = total;

    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.dataset.total = total;
    }
}



document.getElementById('confirmBooking')?.addEventListener('click', async function () {
    if (selectedSeats.length === 0) {
        showNotification('Выберите хотя бы одно место', 'warning');
        return;
    }

    const customerName = prompt('Введите ваше имя:');
    if (!customerName) return;

    const customerEmail = prompt('Введите ваш email:');
    if (!customerEmail) return;

    const customerPhone = prompt('Введите ваш телефон:');
    if (!customerPhone) return;

    try {
        console.log('🔄 Создание бронирования...');

        const bookingData = {
            seance_id: currentSeance.id,
            seats: selectedSeats.map(seat => ({
                row: seat.row,
                seat: seat.seat
            })),
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone
        };

        const result = await cinemaAPI.createBooking(bookingData);

        console.log('✅ Бронирование создано:', result);


        bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();


        showTicket(result);

    } catch (error) {
        console.error('❌ Ошибка бронирования:', error);
        showNotification('Ошибка бронирования: ' + error.message, 'danger');
    }
});



function showTicket(booking) {
    const ticketContent = document.getElementById('ticketContent');
    if (!ticketContent) return;

    const code = booking.code || 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const filmTitle = currentSeance?.film?.title || 'Фильм';
    const date = currentSeance?.date || formatDateForDisplay(new Date());
    const time = currentSeance?.time || '00:00';
    const hallName = currentHall?.name || 'Зал';
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);


    let qrImage = '';
    if (typeof qrcode !== 'undefined') {
        const qr = qrcode(0, 'L');
        qr.addData(JSON.stringify({
            code: code,
            film: filmTitle,
            date: date,
            time: time,
            hall: hallName,
            seats: selectedSeats.map(s => `${s.row}-${s.seat}`).join(',')
        }));
        qr.make();
        qrImage = `<img src="${qr.createDataURL(10)}" alt="QR-код" class="qr-code">`;
    }

    ticketContent.innerHTML = `
        <div class="ticket">
            <div class="ticket-header">
                <h4>Электронный билет</h4>
                <p class="ticket-code">Код: ${code}</p>
            </div>
            <div class="ticket-body">
                <div class="row">
                    <div class="col-8">
                        <p><strong>Фильм:</strong> ${escapeHtml(filmTitle)}</p>
                        <p><strong>Дата и время:</strong> ${date} ${time}</p>
                        <p><strong>Зал:</strong> ${escapeHtml(hallName)}</p>
                        <p><strong>Места:</strong> ${selectedSeats.map(s => `${s.row}-${s.seat}`).join(', ')}</p>
                        <p><strong>Стоимость:</strong> ${total} ₽</p>
                    </div>
                    <div class="col-4 text-center">
                        ${qrImage}
                    </div>
                </div>
                <div class="ticket-footer mt-4">
                    <p class="text-muted small mb-2">
                        <i class="fas fa-exclamation-triangle"></i>
                        Билет действителен строго на свой сеанс
                    </p>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.print()">
                        <i class="fas fa-print"></i> Распечатать
                    </button>
                </div>
            </div>
        </div>
    `;

    const ticketModal = new bootstrap.Modal(document.getElementById('ticketModal'));
    ticketModal.show();
}



function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date) {
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '.');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {

    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${escapeHtml(message)}
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
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}


document.addEventListener('shown.bs.dropdown', function () {
    console.log('Dropdown открыт');
});


/*document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('card-img-top')) {
        e.target.src = 'img/title.svg';
    }
}, true);*/

console.log('✅ app.js полностью загружен');