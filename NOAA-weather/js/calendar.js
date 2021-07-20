/**
 * Calendar.js
 *
 * Displays a simple monthly calendar with controls to select other months and
 * years and a day within the current month. A span of days can be designated as
 * shaded.
 */

/**
 * A utility to return the number of days in a given month.
 * @param iMonth {number}
 * @param iYear  {number}
 * @return {number}
 */
function daysInMonth(iMonth, iYear) {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}

// noinspection JSValidateJSDoc
/**
 * A utility to create a DOM element with classes and content.
 * @param tag {string}
 * @param [classList] {[string]|string}
 * @param [content] {[Element|Attr]|Element|Attr|string}
 * @return {Element}
 */
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

// noinspection JSValidateJSDoc
/**
 * A utility to create a DOM attribute node.
 * @param name {string}
 * @param value {*}
 * @return {Attr}
 */
function createAttribute(name, value) {
  let attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

/**
 * A utility to find an ancestor element that has a given class.
 * @param el {Element}
 * @param myClass {string}
 * @return {Element|undefined}
 */
function findAncestorElementWithClass(el, myClass) {
  while (el !== null && el.parentElement !== el) {
    if (el.classList.contains(myClass)) {
      return el;
    }
    el = el.parentElement;
  }
}

function renderCalendarFrame(attachmentEl, title) {
  const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
      createElement('input', 'year-select', [
          createAttribute('type', 'number'),
          createAttribute('min', 1850),
          createAttribute('max', new Date().getFullYear()),
          createAttribute('step', 1)
          ])
    ]),
    createElement('button', 'next-button', '\u203a')
  ]);
  let calendarTable = createElement('table', 'table-calendar', [
      createAttribute('data-lang', 'en'),
      createElement('thead', 'thead-month', [
          createElement('tr', [], days.map(function (day) {
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

function renderMonth(calendarEl, tableEl, selectedDate, month, year, shadedDateRange) {
  let months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
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

        row.appendChild(cell);
        date++;
      }
    }
    tableEl.appendChild(row);
    refreshRange(calendarEl, shadedDateRange);
    refreshSelectedDate(calendarEl, selectedDate);
  }

}

function inShadedDateRange(date, range) {
  return (date && date >= range.fromDate && date <= range.toDate);
}

function refreshRange(calendarEl, shadedDateRange) {
  if (!shadedDateRange) {
    return;
  }
  let tblEl = calendarEl.querySelector(".calendar-body");
  let days = tblEl.querySelectorAll('td');
  days.forEach(function (dayEl) {
    let year = dayEl.getAttribute('data-year');
    if (year == null) { return; }
    let month = dayEl.getAttribute('data-month') - 1;
    let day = dayEl.getAttribute('data-date');
    let date = new Date(year, month, day);
    if (inShadedDateRange(date, shadedDateRange)) {
      dayEl.classList.add('cal-shade')
    } else {
      dayEl.classList.remove('cal-shade')
    }
  });
}

function refreshSelectedDate(calendarEl, selectedDate) {
  if (!calendarEl || !selectedDate) { return; }
  let selectedYear = String(selectedDate.getFullYear());
  let selectedMonth = String(selectedDate.getMonth() + 1);
  let selectedDay = String(selectedDate.getDate());
  let tblEl = calendarEl.querySelector('.calendar-body');
  if (!tblEl) { return; }
  tblEl.querySelectorAll('.date-picker').forEach(function (el) {
    el.classList.remove('selected');
    if (el.getAttribute('data-year') !== selectedYear) { return; }
    if (el.getAttribute('data-month') !== selectedMonth) { return; }
    if (el.getAttribute('data-date') !== selectedDay) { return; }
    el.classList.add('selected');
  });
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
    refreshSelectedDate(this.calendarEl, this._selectedDate);
    return date;
  }

  get shadedDateRange() {
    return this._shadedDateRange;
  }

  /**
   *
   * @param range {{fromDate, toDate}}
   */
  set shadedDateRange(range) {
    this._shadedDateRange = range;
    refreshRange(this.calendarEl, this._shadedDateRange);
    return range;
  }

  /**
   * Refreshes calendar view from model
   */
  updateCalendar(month, year) {
    setSelectedMonthYear(this.calendarEl, month, year);
    let tbl = this.calendarEl.querySelector(".calendar-body");
    renderMonth(this.calendarEl, tbl, this.selectedDate, month, year, this.shadedDateRange);
  }

  constructor (calendarEl, selectedDate, title, onDateChange) {
    this.calendarEl = calendarEl;
    this.selectedDate = selectedDate;
    this.onDateChange = onDateChange;
    let _this = this;

    renderCalendarFrame(calendarEl, title);

    let currentMonth = this.selectedDate.getMonth();
    let currentYear = this.selectedDate.getFullYear();

    showCalendar(currentMonth, currentYear);

    function next() {
      currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
      currentMonth = (currentMonth + 1) % 12;
      showCalendar(currentMonth, currentYear);
      updateDate(currentYear, currentMonth, _this.selectedDate.getDate());
    }

    function previous() {
      currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
      currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
      showCalendar(currentMonth, currentYear);
      updateDate(currentYear, currentMonth, _this.selectedDate.getDate());
    }

    function jump() {
      let selectYear = calendarEl.querySelector(".year-select");
      let selectMonth = calendarEl.querySelector(".month-select");
      currentYear = parseInt(selectYear.value);
      currentMonth = parseInt(selectMonth.value);
      showCalendar(currentMonth, currentYear);
      updateDate(currentYear, currentMonth, _this.selectedDate.getDate());
      this.blur();
    }

    function updateDate(year, month, day) {
      let d = new Date(year, month, day);
      _this.selectedDate = d;
      if (_this.onDateChange) {
        _this.onDateChange(_this, d);
      }
    }

    function dayHandler(ev) {
      let target = ev.target;
      let picker = findAncestorElementWithClass(target, 'date-picker');
      if (picker) {
        let selectedEl = calendarEl.querySelector('.selected');
        selectedEl && selectedEl.classList.remove('selected');
        picker.classList.add('selected');
        updateDate(picker.getAttribute('data-year'),
            picker.getAttribute('data-month') - 1,
            picker.getAttribute('data-date'));
        // let d = new Date(picker.getAttribute('data-year'), picker.getAttribute('data-month') - 1, picker.getAttribute('data-date'));
        // _this.selectedDate = d;
        // if (_this.onDateChange) {
        //   _this.onDateChange(_this, d);
        // }
      }
    }

    function showCalendar(month, year) {
      _this.updateCalendar(month, year);
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
