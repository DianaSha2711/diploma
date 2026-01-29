
document.addEventListener('DOMContentLoaded', async function() {
    
    const dateScroll = document.getElementById('dateScroll');
    const screeningList = document.getElementById('screeningList');
    const movieList = document.getElementById('movieList');
    const currentDateElement = document.getElementById('currentDate');
    const hallLayout = document.getElementById('hallLayout');
    const selectedSeatsElement = document.getElementById('selectedSeats');
    const totalPriceElement = document.getElementById('totalPrice');
    const confirmBookingBtn = document.getElementById('confirmBooking');
    
    
    let currentDate = new Date();
    let selectedScreening = null;
    let selectedSeats = [];
    let currentHall = null;

    
    initDateSelector();
    await loadScreenings();
    await loadMovies();
    
    
    function initDateSelector() {
        dateScroll.innerHTML = '';
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const dateElement = document.createElement('div');
            dateElement.className = 'date-item';
            if (i === 0) {
                dateElement.classList.add('active');
            }
            
            dateElement.innerHTML = `
                <div class="date-day">${date.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
                <div class="date-number">${date.getDate()}</div>
                <div class="date-month">${date.toLocaleDateString('ru-RU', { month: 'short' })}</div>
            `;
            
            dateElement.addEventListener('click', () => {
                document.querySelectorAll('.date-item').forEach(item => {
                    item.classList.remove('active');
                });
                dateElement.classList.add('active');
                currentDate = date;
                currentDateElement.textContent = date.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                loadScreenings();
            });
            
            dateScroll.appendChild(dateElement);
        }
        
        
        currentDateElement.textContent = currentDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    
    async function loadScreenings() {
        try {
            const dateStr = currentDate.toISOString().split('T')[0];
            const screenings = await cinemaAPI.getScreenings(dateStr);
            
            screeningList.innerHTML = '';
            
            screenings.forEach(screening => {
                const screeningElement = document.createElement('div');
                screeningElement.className = 'col-md-6 col-lg-4 mb-4';
                screeningElement.innerHTML = `
                    <div class="card screening-card">
                        <div class="card-body">
                            <h5 class="card-title">${screening.movie.title}</h5>
                            <p class="card-text">
                                <i class="fas fa-clock"></i> ${screening.time}<br>
                                <i class="fas fa-video"></i> ${screening.hall.name}<br>
                                <i class="fas fa-ruble-sign"></i> ${screening.price} руб.
                            </p>
                            <button class="btn btn-primary btn-sm book-btn" data-id="${screening.id}">
                                Выбрать места
                            </button>
                        </div>
                    </div>
                `;
                
                screeningList.appendChild(screeningElement);
            });
            
            
            document.querySelectorAll('.book-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const screeningId = e.target.dataset.id;
                    await openBookingModal(screeningId);
                });
            });
        } catch (error) {
            console.error('Ошибка загрузки сеансов:', error);
            screeningList.innerHTML = '<div class="col-12"><p class="text-danger">Ошибка загрузки расписания</p></div>';
        }
    }

    
    async function loadMovies() {
        try {
            const movies = await cinemaAPI.getMovies();
            
            movieList.innerHTML = '';
            
            movies.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.className = 'col-md-6 col-lg-3 mb-4';
                movieElement.innerHTML = `
                    <div class="card movie-card">
                        <img src="${movie.poster || 'https://via.placeholder.com/300x450'}" 
                             class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">
                                <small class="text-muted">
                                    ${movie.genre} • ${movie.duration} мин.
                                </small>
                            </p>
                            <p class="card-text">${movie.description.substring(0, 100)}...</p>
                        </div>
                    </div>
                `;
                
                movieList.appendChild(movieElement);
            });
        } catch (error) {
            console.error('Ошибка загрузки фильмов:', error);
        }
    }

    
    async function openBookingModal(screeningId) {
        try {
            
            const screenings = await cinemaAPI.getScreenings(currentDate.toISOString().split('T')[0]);
            selectedScreening = screenings.find(s => s.id == screeningId);
            
            if (!selectedScreening) return;
            
            
            currentHall = await cinemaAPI.getHall(selectedScreening.hall.id);
            
            
            selectedSeats = [];
            updateSelectedSeatsDisplay();
            
            
            generateHallLayout(currentHall);
            
            
            const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
            modal.show();
        } catch (error) {
            console.error('Ошибка открытия бронирования:', error);
            alert('Ошибка загрузки данных о зале');
        }
    }

    
    function generateHallLayout(hall) {
        hallLayout.innerHTML = '';
        
        
        const rowsInfo = document.createElement('div');
        rowsInfo.className = 'rows-info';
        hallLayout.appendChild(rowsInfo);
        
        
        for (let row = 1; row <= hall.rows; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';
            
            
            const rowNumber = document.createElement('div');
            rowNumber.className = 'row-number';
            rowNumber.textContent = row;
            rowElement.appendChild(rowNumber);
            
            
            for (let seat = 1; seat <= hall.seatsPerRow; seat++) {
                const seatElement = document.createElement('div');
                seatElement.className = 'seat';
                
                
                const isVIP = hall.vipRows.includes(row);
                if (isVIP) {
                    seatElement.classList.add('vip');
                }
                
                
                const isBooked = selectedScreening.bookedSeats?.some(
                    booked => booked.row === row && booked.seat === seat
                );
                
                if (isBooked) {
                    seatElement.classList.add('booked');
                } else {
                    seatElement.addEventListener('click', () => toggleSeat(row, seat, isVIP));
                }
                
                seatElement.dataset.row = row;
                seatElement.dataset.seat = seat;
                seatElement.title = `Ряд ${row}, Место ${seat}${isVIP ? ' (VIP)' : ''}`;
                
                rowElement.appendChild(seatElement);
            }
            
            hallLayout.appendChild(rowElement);
        }
        
        
        const legend = document.createElement('div');
        legend.className = 'hall-legend mt-3';
        legend.innerHTML = `
            <div class="legend-item">
                <div class="seat available"></div>
                <span>Обычное</span>
            </div>
            <div class="legend-item">
                <div class="seat vip"></div>
                <span>VIP</span>
            </div>
            <div class="legend-item">
                <div class="seat booked"></div>
                <span>Занято</span>
            </div>
            <div class="legend-item">
                <div class="seat selected"></div>
                <span>Выбрано</span>
            </div>
        `;
        hallLayout.appendChild(legend);
    }

    
    function toggleSeat(row, seat, isVIP) {
        const seatIndex = selectedSeats.findIndex(s => s.row === row && s.seat === seat);
        
        if (seatIndex > -1) {
            
            selectedSeats.splice(seatIndex, 1);
        } else {
            
            const price = isVIP ? selectedScreening.vipPrice : selectedScreening.price;
            selectedSeats.push({ row, seat, price, isVIP });
        }
        
       
        const seatElement = document.querySelector(`.seat[data-row="${row}"][data-seat="${seat}"]`);
        seatElement.classList.toggle('selected');
        
        updateSelectedSeatsDisplay();
    }

    
    function updateSelectedSeatsDisplay() {
        selectedSeatsElement.innerHTML = '';
        
        if (selectedSeats.length === 0) {
            selectedSeatsElement.innerHTML = '<p class="text-muted">Места не выбраны</p>';
            totalPriceElement.textContent = '0';
            return;
        }
        
        let total = 0;
        selectedSeats.forEach(seat => {
            const seatElement = document.createElement('div');
            seatElement.className = 'selected-seat-item';
            seatElement.innerHTML = `
                Ряд ${seat.row}, Место ${seat.seat}${seat.isVIP ? ' (VIP)' : ''} - ${seat.price} руб.
            `;
            selectedSeatsElement.appendChild(seatElement);
            total += seat.price;
        });
        
        totalPriceElement.textContent = total;
    }

    
    confirmBookingBtn.addEventListener('click', async () => {
        if (selectedSeats.length === 0) {
            alert('Выберите хотя бы одно место');
            return;
        }

        try {
            const bookingData = {
                screeningId: selectedScreening.id,
                seats: selectedSeats,
                customerInfo: {
                    name: prompt('Введите ваше имя:'),
                    email: prompt('Введите ваш email:'),
                    phone: prompt('Введите ваш телефон:')
                },
                totalPrice: selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
            };

            
            const booking = await cinemaAPI.createBooking(bookingData);
            
            
            generateTicket(booking);
            
            
            const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            bookingModal.hide();
            
        } catch (error) {
            console.error('Ошибка бронирования:', error);
            alert('Ошибка при бронировании. Попробуйте еще раз.');
        }
    });

    
    function generateTicket(booking) {
        const ticketContent = document.getElementById('ticketContent');
        
        
        const ticketData = {
            code: booking.code,
            movie: selectedScreening.movie.title,
            date: selectedScreening.date,
            time: selectedScreening.time,
            hall: currentHall.name,
            seats: selectedSeats.map(s => `Ряд ${s.row}, Место ${s.seat}`).join(', '),
            totalPrice: booking.totalPrice
        };
        
        
        const qr = qrcode(0, 'L');
        qr.addData(JSON.stringify(ticketData));
        qr.make();
        const qrImage = qr.createDataURL(10);
        
        
        ticketContent.innerHTML = `
            <div class="ticket">
                <div class="ticket-header">
                    <h4>Билет в кино</h4>
                    <p class="ticket-code">Код: ${booking.code}</p>
                </div>
                <div class="ticket-body">
                    <div class="row">
                        <div class="col-8">
                            <p><strong>Фильм:</strong> ${selectedScreening.movie.title}</p>
                            <p><strong>Дата и время:</strong> ${selectedScreening.date} ${selectedScreening.time}</p>
                            <p><strong>Зал:</strong> ${currentHall.name}</p>
                            <p><strong>Места:</strong> ${selectedSeats.map(s => `Ряд ${s.row}, Место ${s.seat}`).join(', ')}</p>
                            <p><strong>Стоимость:</strong> ${booking.totalPrice} руб.</p>
                        </div>
                        <div class="col-4">
                            <img src="${qrImage}" alt="QR Code" class="qr-code">
                        </div>
                    </div>
                    <div class="ticket-footer">
                        <p class="text-muted small">
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
});