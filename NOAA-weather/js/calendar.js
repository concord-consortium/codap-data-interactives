function daysInMonth(iMonth, iYear) {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}

function createElement(tag, classList, content) {
  let el = document.createElement(tag);
  if (classList) {
    if (typeof classList === 'string') classList = [classList];
    classList.forEach( function (cl) {el.classList.add(cl);});
  }
  if (content) {
    if (!Array.isArray(content)) { content = [content];}
    content.forEach(function(c) {
      if (c instanceof Attr) {
        el.setAttributeNode(c);
      } else {
        el.append(c);
      }
    });
  }
  return el;
}

function createAttribute(name, value) {
  let attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}


function renderCalendarFrame(attachmentEl, title) {
  const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  let yearSelect = new Array(51).fill(0).map(function(x, ix) {
    return (new Date().getFullYear() - 50 + ix);
  }).map(function (yr) {
    return createElement('option', [], String(yr));
  });

  title = title || 'Calendar';

  let titleRow = createElement('div', ['wx-calendar-title'], title);
  let buttonRow = createElement('div', 'button-container-calendar', [
    createElement('button', 'previous-button', '\u2039'),
    createElement('div', 'footer-container-calendar', [
      createElement('select', 'month-select', monthShortNames.map(function (msn, ix) {
        return createElement('option', [], [
            createAttribute('value', String(ix)),
            msn
        ]);
      })),
      ' ',
      createElement('select', 'year-select', yearSelect)
    ]),
    createElement('button', 'next-button', '\u203a')
  ]);
  let calendarTable = createElement('table', 'table-calendar', [
      createAttribute('data-lang', 'en'),
      createElement('thead', 'thead-month', [
          createElement('tr', [], days.map(function (day, ix) {
            return createElement('th', [], [
                createAttribute('data-day', day),
                String(day)
            ]);
          }))
      ]),
      createElement('tbody', 'calendar-body')
  ]);
  attachmentEl.classList.add('container-calendar');
  attachmentEl.append(titleRow);
  attachmentEl.append(buttonRow);
  attachmentEl.append(calendarTable);
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

  constructor (calendarEl, selectedDate, title) {
    this.calendarEl = calendarEl;
    this.selectedDate = selectedDate;
    let _this = this;

    renderCalendarFrame(calendarEl, title);

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
