document.addEventListener('DOMContentLoaded', async function () {
    console.log('🎬 Приложение загружено');

    try {

		const donMain = document.getElementById('main_panel');
	    const domBooking = document.getElementById('bookingPanel');
		domBooking.style.display = "none";
	    const domTickets = document.getElementById('bookedTikets');
		domTickets.style.display = "none";
	    const domQr = document.getElementById('bookedGrQode');
		domQr.style.display = "none";

		const btnCancelBooking = document.getElementsByClassName('cancelBooking');
		for(const btn of btnCancelBooking) {
			btn.onclick = () => {
				domBooking.style.display = "none"; 
				domTickets.style.display = "none"; 
				domQr.style.display = "none"; 
        		donMain.style.display = "";
			}
		}

        initDateSelector();

        await cinemaAPI.getAllData();

        loadSeances();

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

    if (nCurrWeek > 0) {
        const dateElement = document.createElement('div');
        dateElement.className = 'date_item chevrons';

        dateElement.innerHTML = `<img src="./img/chevron-left.svg">`;
        dateElement.onclick = () => {
            nCurrWeek--;
            if (nCurrWeek < 0) nCurrWeek = 0;
            initDateSelector();
        }
        dateScroll.appendChild(dateElement);
    }
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i + nCurrWeek * 7);

        const dateElement = document.createElement('div');
        dateElement.className = 'date_item';
        if (i === 0 && nCurrWeek == 0) {
            dateElement.classList.add('active');
            dateElement.innerHTML = `Сегодня <br>
            <span class="date-day">${formatDay(date)}</span>
            <span class="date-number">${date.getDate()}</span>
        `;
            dateElement.addEventListener('click', () => {
                document.querySelectorAll('.date_item').forEach(el => el.classList.remove('active'));
                dateElement.classList.add('active');
                currentDate = date;
                bToday = true;
                loadSeances();
            });

        } else {
            dateElement.innerHTML = `
            <div class="date-day">${formatDay(date)}</div>
            <div class="date-number">${date.getDate()}</div>
        `;

            dateElement.addEventListener('click', () => {
                document.querySelectorAll('.date_item').forEach(el => el.classList.remove('active'));
                dateElement.classList.add('active');
                currentDate = date;
                bToday = false;
                loadSeances();
            });
        }

        dateScroll.appendChild(dateElement);
    }
    const dateElement = document.createElement('div');
    dateElement.className = 'date_item chevrons';

    dateElement.innerHTML = `<img src="./img/chevron-right.svg">`;
    dateElement.onclick = () => {
        nCurrWeek++;
        initDateSelector();
    }
    dateScroll.appendChild(dateElement);

}

function formatDay(date) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' }).slice(0, 3);
}

function formatMonth(date) {
    return date.toLocaleDateString('ru-RU', { month: 'short' }).slice(0, 3);
}

/*function updateCurrentDateDisplay() {
    const element = document.getElementById('currentDate');
    if (element) {
        element.textContent = currentDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}*/



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
    col.className = 'col-md-6 col-lg-3';

    const poster = film.film_poster || 'img/title.svg';
    const rating = film.film_rating ? film.rating.toFixed(1) : '0.0';
    const duration = film.film_duration || 0; 'img/title.svg';
    const country = film.film_country || '';
    const description = film.film_description
        ? film.film_description.substring(0, 100) + (film.film_description.length > 100 ? '...' : '')
        : 'Описание отсутствует';

    col.innerHTML = `
        <div class="film_card h100">
            <img src="${poster}" 
                 class="card_img-top" 
                 alt="${film.film_title}"
                 onerror="this.src='img/title.svg'">
            <div class="card_body">
                <h5 class="film-title">${escapeHtml(film.film_title)}</h5>
                <div>
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
            hall.aData.push({ time: time_hall.time, seanceId: time_hall.seanceId });
        } else {
            aHalls.push({ id: time_hall.hall, aData: [{ time: time_hall.time, seanceId: time_hall.seanceId }] });
        }
    });
    const today = new Date();
    aHalls.forEach(hall => {
        const currHall = allHalls.find(it => it.id === hall.id);
        let hallName = 'Неизвестный зал';
        if (currHall) {
            hallName = currHall.hall_name.toUpperCase();
        }
        sTimes += `<div class="seance-hall">${hallName}<br>`
        hall.aData.forEach(data => {

            if (bToday) {
                const todayDateStr = today.toISOString().split('T')[0];
                const fullDateTimeStr = `${todayDateStr}T${data.time}:00`;

                const dateFromTime = new Date(fullDateTimeStr);
                if (today > dateFromTime) {
                    sTimes += `<button class="seance-time_btn" disabled=true>${data.time}</button>`
                } else {
                    sTimes += `<button class="seance-time_btn" onclick="openBookingModal(${data.seanceId})">${data.time}</button>`
                }

            } else {
 				sTimes += `<button class="seance-time_btn" onclick="openBookingModal(${data.seanceId})">${data.time}</button>`
            }

           
        })
        sTimes += `</div>`
    });

    col.innerHTML = `
        <div class="card1 seance_card">
            <div class="card_body">
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

    return col;
}

async function openBookingModal(seanceId) {
    try {
        console.log(`🎫 Открытие бронирования для сеанса ${seanceId}`);

        const currentSeance = await cinemaAPI.getSeance(seanceId);
        if (!currentSeance) throw new Error('Сеанс не найден. Обновите страницу (F5)');

        generateHallLayout(currentSeance);

        const donMain = document.getElementById('main_panel');
        donMain.style.display = "none"

        const domBooking = document.getElementById('bookingPanel');
        domBooking.style.display = ""

		CalcScreenSize();


    } catch (error) {
        console.error('❌ Ошибка открытия бронирования:', error);
        showNotification('Ошибка загрузки данных: ' + error.message, 'danger');
    }
}

function generateHallLayout(currentSeance) {
    const currentHall = cinemaAPI.getHall(currentSeance.seance_hallid);
    if (!currentHall) throw new Error('Зал не найден');

    if(!createSeats(currentHall)) throw new Error('Hall layout problem');;
	if(!addHallLegend(currentHall)) throw new Error('Hall legend problem');;

    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn) {
        confirmBtn.onclick = () => { 
			confirmBooking(currentSeance) 
		}
    }

}

function GenerateOrder(){

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
            col.className = 'col-md-6 col-lg-4';

            col.innerHTML = `
                <div class="seance_card h100">
                    <div>
                        <div class="col-4">
                            <img src="${film.poster || 'https://via.placeholder.com/150x200/2c3e50/ffffff?text=Кино'}" 
                                 class="img-fluid rounded-start h100" 
                                 style="object-fit: cover;"
                                 alt="${film.title}"
                                 onerror="this.src='https://via.placeholder.com/150x200/2c3e50/ffffff?text=Кино'">
                        </div>
                        <div class="col-8">
                            <div class="card_body">
                                <h5 class="film-title">${escapeHtml(film.title)}</h5>
                                <div class="seance-info">
                                    <p>
                                        <i class="fas fa-video me-2"></i>
                                        <span class="seance-hall">${escapeHtml(hall.name)}</span>
                                    </p>
                                    <p>
                                        <i class="fas fa-clock me-2"></i>
                                        <span class="seance-time">${seance.time}</span>
                                    </p>
                                    <p>
                                        <i class="fas fa-calendar me-2"></i>
                                        ${seance.date}
                                    </p>
                                    <p>
                                        <i class="fas fa-ruble-sign me-2"></i>
                                        <strong>${seance.price} ₽</strong>
                                        ${seance.vip_price ?
                    `<span class="badge bg-warning text-dark ms-2">VIP: ${seance.vip_price} ₽</span>`
                    : ''}
                                    </p>
                                </div>
                                <button class="btn btn_primary w-100 book_btn" 
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


        document.querySelectorAll('.book_btn').forEach(btn => {
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

function updateSelectedSeatsDisplay() {
    const container = document.getElementById('selectedSeats');
    const totalElement = document.getElementById('totalPrice');
    if (!container || !totalElement) return;

    const confirmBtn = document.getElementById('confirmBooking');
    const domSelectedSeats = document.getElementsByClassName('selected');
    const aSelectedSeats = Array.from(domSelectedSeats);
    aSelectedSeats.splice(aSelectedSeats.length - 1);
    if (aSelectedSeats.length <= 0) {
        container.innerHTML = '<p class="text-muted">Места не выбраны</p>';
        totalElement.textContent = '0';
        if (confirmBtn) confirmBtn.disabled = true;
        return;
    }

    let total = 0;
    let seatsHtml = '<div class="selected-seats-list">';

    aSelectedSeats.forEach(seat => {
        seatsHtml += `
            <div class="selected-seat-item">
                Ряд ${seat.row}, Место ${seat.seat} 
                ${seat.classList.contains('vip') ? '<span class="badge bg-warning text-dark">VIP</span>' : ''}
                - ${seat.price} ₽
            </div>
        `;
        total += seat.price;
    });

    seatsHtml += '</div>';
    container.innerHTML = seatsHtml;
    totalElement.textContent = total;

    if (confirmBtn) {
        confirmBtn.disabled = false;
    }
}

function confirmBooking(currentSeance){
    const domSelectedSeats = document.getElementsByClassName('selected');
    const aSelectedSeats = Array.from(domSelectedSeats);
    aSelectedSeats.splice(aSelectedSeats.length - 1);
    if (aSelectedSeats.length <= 0) {
		alert("Места не выбраны");
        return;
    }

    let total = 0;
	const aTickets = [];
    let seatsHtml = '';
    aSelectedSeats.forEach(seat => {
		aTickets.push({
			row: seat.row, // Ряд
			place: seat.seat, // Место
			coast: seat.price, // Стоимость  билета
		});
		seatsHtml += `
            <div class="selected-seat-item">
                Ряд ${seat.row}, Место ${seat.seat} 
                ${seat.classList.contains('vip') ? '<span class="badge bg-warning text-dark">VIP</span>' : ''}
            </div>
        `;
        total += seat.price;
    });

	const domTickets = document.getElementById('bookingInfo');
	domTickets.innerHTML = "На фильм <br>" + seatsHtml 
							+ "<br>В зале: " 
							+ "<br>Начало сеанса: " 
							+ "<br>Стоимость: " + total + " ₽";

	document.getElementById('bookingPanel').style.display = "none";
	document.getElementById('bookedTikets').style.display = "";

	const btnQrRequest = document.getElementById('getGrCode');
    if (btnQrRequest) {
        btnQrRequest.onclick = () => {
			RequestBooking(currentSeance, aTickets)
		};
    }
}

async function RequestBooking(currentSeance, tickets) {
    try {
        console.log('🔄 Создание бронирования...');

        const bookingData = {seanceId: currentSeance.id,
            ticketDate: formatDateForDisplay(new Date()),
            tickets
        };

        const result = await cinemaAPI.createBooking(bookingData);

        console.log('✅ Бронирование создано:', result);

		document.getElementById('bookedTikets').style.display = "none";
		document.getElementById('bookedGrQode').style.display = "";

        showTicket(result);

    } catch (error) {
        console.error('❌ Ошибка бронирования:', error);
        showNotification('Ошибка бронирования' + (error && error.message) ? ': ' + error.message : '', 'danger');
    }
}

function showTicket(booking) {
    const ticketContent = document.getElementById('bookedGrQode');
    if (!ticketContent) return;
    ticketContent.innerHTML = "";

    for (const ticket of booking) {
        const filmTitle = ticket.ticket_filmname || 'Фильм';
        const date = ticket.ticket_date || formatDateForDisplay(new Date());
        const time = ticket.ticket_time || '00:00';
        const hallName = ticket.ticket_hallname || 'Зал';
        const total = ticket.ticket_price || 0;

        let qrImage = '';
        if (typeof qrcode !== 'undefined') {
            const qr = qrcode(0, 'L');
            qr.addData(JSON.stringify({
                //code: code,
                film: filmTitle,
                date: date,
                time: time,
                hall: hallName,
                row: ticket.ticket_row,
                place: ticket.ticket_place,
            }));
            qr.make();
            qrImage = `<img src="${qr.createDataURL(10)}" alt="QR-код" class="qr-code">`;
        }

        ticketContent.innerHTML += `
        <div class="ticket">
            <div class="ticket-header">
                <h4>Электронный билет</h4>
            </div>
            <div class="ticket-body">
                <div class="row">
                    <div class="col-8">
                        <p><strong>Фильм:</strong> ${escapeHtml(filmTitle)}</p>
                        <p><strong>Дата и время:</strong> ${date} ${time}</p>
                        <p><strong>Зал:</strong> ${escapeHtml(hallName)}</p>
                        <p><strong>Ряд: </strong> ${ticket.ticket_row}, <strong>Место: </strong>${ticket.ticket_place}</p>
                        <p><strong>Стоимость:</strong> ${ticket.ticket_price} ₽</p>
                    </div>
                    <div>
                        ${qrImage}
                    </div>
                </div>
                <div class="ticket-footer">
                    <p class="text-muted smal">
                        <i class="fas fa-exclamation-triangle"></i>
                        Билет действителен строго на свой сеанс
                    </p>
                    <button class="btn btn_sm btn_outline-primary" onclick="window.print()">
                        <i class="fas fa-print"></i> Распечатать
                    </button>
                </div>
            </div>
        </div>
    `;
    }
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
    }).replace(/\//g, '-').replace(/\./g, '-');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ app.js полностью загружен');