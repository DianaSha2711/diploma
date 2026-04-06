let nCurrWeek = 0;
let sCurrDate = "";
let bToday = true;

function createSeats(currentHall){
	const container = document.getElementById('hallLayout');
    if (!container) return false;
    
	container.innerHTML = '';

    const domSelectedSeats = document.getElementById('selectedSeats');
    if(domSelectedSeats) domSelectedSeats.innerHTML = '<p class="text-muted">Места не выбраны</p>';

    const domTotalElement = document.getElementById('totalPrice');
    if(domTotalElement) domTotalElement.innerText = '0';

    for (let row = 1; row <= currentHall.hall_rows; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'seat_row';
        rowElement.dataset.row = row;

        for (let seat = 1; seat <= currentHall.hall_places; seat++) {
            const seatElement = createSeatElement(row, seat, currentHall);
            rowElement.appendChild(seatElement);
        }

        container.appendChild(rowElement);
    }

	return true
}


function createSeatElement(row, seat, currentHall) {
    const seatElement = document.createElement('div');
    seatElement.className = 'seat';
    seatElement.row = row;
    seatElement.seat = seat;
    //seatElement.textContent = seat;


    const seatStatus = currentHall.hall_config[row - 1][seat - 1];

    if (seatStatus === 'taken') {
        seatElement.classList.add('taken');
    } else if (seatStatus === 'disabled') {
        seatElement.classList.add('disabled');
    } else if (seatStatus === 'vip') {
        seatElement.classList.add('vip');
        seatElement.price = currentHall.hall_price_vip;
        seatElement.onclick = () => {
            if (seatElement.classList.contains('selected')) {
                seatElement.classList.remove('selected');
            } else {
                seatElement.classList.add('selected');
            }
            //updateSelectedSeatsDisplay();
        }
    } else {
        seatElement.classList.add('available');
        seatElement.price = currentHall.hall_price_standart;
        seatElement.onclick = () => {
            if (seatElement.classList.contains('selected')) {
                seatElement.classList.replace('selected', 'available');
            } else {
                seatElement.classList.replace('available', 'selected');
            }
            //updateSelectedSeatsDisplay();
        }
    }

    return seatElement;
}

function addHallLegend(currentHall) {
    const legend = document.getElementById('hallLegend');
    if(!legend) return false;
	
    legend.innerHTML = `
        <div class="legend_col">
			<div class="legend_item">
				<div class="seat available"></div>
				<span>Свободно (${currentHall.hall_price_standart} ₽)</span>
			</div>
			<div class="legend_item">
				<div class="seat vip"></div>
				<span>Свободно VIP (${currentHall.hall_price_vip} ₽)</span>
			</div>
		</div>
        <div class="legend_col">
			<div class="legend_item">
				<div class="seat booked"></div>
				<span>Занято</span>
			</div>
			<div class="legend_item">
				<div class="seat selected"></div>
				<span>Выбрано</span>
			</div>
		</div>
    `;
	return true
}

function CalcScreenSize(){
	const domScreen = document.getElementById('screen_png');
	if(domScreen){
		const nContainerWidth = document.getElementById('hallLayout').getBoundingClientRect().width;
		domScreen.style.width = nContainerWidth + "px";
	}
}