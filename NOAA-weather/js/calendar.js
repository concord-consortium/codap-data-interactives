/**
 * Utility to generate options for year selector
 * @param start
 * @param end
 * @return {string}
 */
function generate_year_range(start, end) {
  let years = "";
  for (let year = start; year <= end; year++) {
    years += "<option value='" + year + "'>" + year + "</option>";
  }
  return years;
}

function daysInMonth(iMonth, iYear) {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}

function renderCalendarFrame(attactmentEl) {
  attactmentEl.innerHTML = '<div class="button-container-calendar">\n' +
      '<button class="previous-button">&#8249;</button>\n' +
      '    <div class="footer-container-calendar">\n' +
      '      <select class="month-select" >\n' +
      '        <option value=0>Jan</option>\n' +
      '        <option value=1>Feb</option>\n' +
      '        <option value=2>Mar</option>\n' +
      '        <option value=3>Apr</option>\n' +
      '        <option value=4>May</option>\n' +
      '        <option value=5>Jun</option>\n' +
      '        <option value=6>Jul</option>\n' +
      '        <option value=7>Aug</option>\n' +
      '        <option value=8>Sep</option>\n' +
      '        <option value=9>Oct</option>\n' +
      '        <option value=10>Nov</option>\n' +
      '        <option value=11>Dec</option>\n' +
      '      </select>\n' +
      '      <select class="year-select"></select>\n' +
      '    </div>\n' +
      '    <button class="next-button">&#8250;</button>\n' +
      '  </div>\n' +
      '  <table class="table-calendar" id="calendar" data-lang="en">\n' +
      '    <thead class="thead-month"></thead>\n' +
      '    <tbody class="calendar-body"></tbody>\n' +
      '  </table>\n';
  attactmentEl.classList.add('container-calendar');
  let selectYear = attactmentEl.querySelector(".year-select");
  selectYear.innerHTML = generate_year_range(1970, 2050);

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  let day;

  let dayHeader = "<tr>";
  for (day = 0; day < days.length; day++) {
    dayHeader += "<th data-days='" + days[day] + "'>" + days[day] + "</th>";
  }
  dayHeader += "</tr>";

  attactmentEl.querySelector(".thead-month").innerHTML = dayHeader;
}

function setSelectedMonthYear(calendarEl, month, year) {
  let selectYearEl = calendarEl.querySelector(".year-select");
  let selectMonthEl = calendarEl.querySelector(".month-select");
  if (year)selectYearEl.value = year;
  if (month != null) selectMonthEl.value = month;
}

function renderMonth(calendarEl, tableEl, selectedDate, month, year) {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let firstDay = ( new Date( year, month ) ).getDay();
  let cell, cellText;

  tableEl.innerHTML = "";
  // creating all cells
  let date = 1;
  for ( let i = 0; i < 6; i++ ) {
    let row = document.createElement("tr");

    for ( let j = 0; j < 7; j++ ) {
      if ( i === 0 && j < firstDay ) {
        cell = document.createElement( "td" );
        cellText = document.createTextNode("");
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else if (date > daysInMonth(month, year)) {
        break;
      } else {
        cell = document.createElement("td");
        cell.setAttribute("data-date", date);
        cell.setAttribute("data-month", month + 1);
        cell.setAttribute("data-year", year);
        cell.setAttribute("data-month_name", months[month]);
        cell.className = "date-picker";
        cell.innerHTML = "<span>" + date + "</span>";

        if ( date === selectedDate.getDate() &&
            year === selectedDate.getFullYear() &&
            month === selectedDate.getMonth() ) {
          cell.className = "date-picker selected";
        }
        row.appendChild(cell);
        date++;
      }
    }
    tableEl.appendChild(row);
  }

}

class Calendar {

  get selectedDate() {
    return this._selectedDate;
  }

  set selectedDate(date) {
    if (!date) {
      date = new Date();
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    this._selectedDate = date;
    return date;
  }

  updateCalendar(month, year) {
    setSelectedMonthYear(calendarEl, month, year);
    let tbl = calendarEl.querySelector(".calendar-body");
    renderMonth(calendarEl, tbl, selectedDate, month, year);
  }

  constructor (calendarEl, selectedDate) {
    this.calendarEl = calendarEl;
    this.selectedDate = selectedDate;
    let _this = this;

    renderCalendarFrame(calendarEl);

    let currentMonth = this.selectedDate.getMonth();
    let currentYear = this.selectedDate.getFullYear();

    showCalendar(currentMonth, currentYear);

    function next() {
      currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
      currentMonth = (currentMonth + 1) % 12;
      showCalendar(currentMonth, currentYear);
    }

    function previous() {
      currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
      currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
      showCalendar(currentMonth, currentYear);
    }

    function jump() {
      let selectYear = calendarEl.querySelector(".year-select");
      let selectMonth = calendarEl.querySelector(".month-select");
      currentYear = parseInt(selectYear.value);
      currentMonth = parseInt(selectMonth.value);
      showCalendar(currentMonth, currentYear);
    }

    function dayHandler(ev) {
      let target = ev.target;
      let picker = target.parentElement;
      let selectedEl = calendarEl.querySelector('.selected');
      selectedEl && selectedEl.classList.remove('selected');
      picker.classList.add('selected');
      let d = new Date(picker.getAttribute('data-year'), picker.getAttribute('data-month') - 1, picker.getAttribute('data-date'));
      _this.selectedDate = d;
    }

    function showCalendar(month, year) {
      setSelectedMonthYear(calendarEl, month, year);
      let tbl = calendarEl.querySelector(".calendar-body");
      renderMonth(calendarEl, tbl, _this.selectedDate, month, year);
    }

    calendarEl.querySelector('.previous-button').onclick = previous;
    calendarEl.querySelector('.next-button').onclick = next;
    calendarEl.querySelector('.year-select').onchange = jump;
    calendarEl.querySelector('.month-select').onchange = jump;
    calendarEl.querySelector('.calendar-body').onclick = dayHandler;
  }
}

// let c = new Calendar(document.getElementById('calendar-anchor'), new Date());
export {Calendar};
