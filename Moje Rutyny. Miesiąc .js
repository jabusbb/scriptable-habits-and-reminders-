// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: check;
// =========================
// MONTHLY HABIT TRACKER
// =========================

const REMINDER_LIST = "Rutyny"
const HABIT = args.widgetParameter || "Creatyna"

// =========================
// LOAD DATA
// =========================

let calendar = await Calendar.forRemindersByTitle(REMINDER_LIST)
let reminders = await Reminder.all([calendar], true)

// =========================
// DATE HELPERS
// =========================

let today = new Date()
let year = today.getFullYear()
let month = today.getMonth()

let firstDay = new Date(year, month, 1)
let daysInMonth = new Date(year, month + 1, 0).getDate()

function dayIndex(date) {
  let d = date.getDay()
  return d === 0 ? 6 : d - 1
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function completedOnDay(date) {
  return reminders.some(r => {
    if (r.title.trim() !== HABIT.trim()) return false
    if (!r.isCompleted) return false
    if (!r.dueDate) return false
    return sameDay(new Date(r.dueDate), date)
  })
}

// =========================
// WIDGET
// =========================

let widget = new ListWidget()

let gradient = new LinearGradient()
gradient.colors = [
  new Color("#111111"),
  new Color("#1c1c1e")
]
gradient.locations = [0, 1]

widget.backgroundGradient = gradient
widget.setPadding(14, 30, 14, 14)

const DAYS = ["M","T","W","T","F","S","S"]
const WIDGET_WIDTH = 338
const PADDING = 48
const CELL = Math.floor((WIDGET_WIDTH - PADDING) / 7)

// TYTUŁ
let titleTxt = widget.addText(HABIT)
titleTxt.font = Font.boldSystemFont(10)
titleTxt.textColor = Color.white()

widget.addSpacer(1)

// MIESIĄC
let df = new DateFormatter()
df.dateFormat = "LL yyyy"
let monthTxt = widget.addText(df.string(today))
monthTxt.font = Font.systemFont(18)
monthTxt.textColor = new Color("#8E8E93")

widget.addSpacer(1)

// HEADER DNI TYGODNIA
let header = widget.addStack()
header.layoutHorizontally()

for (let d of DAYS) {
  let cell = header.addStack()
  cell.size = new Size(CELL, 16)
  cell.centerAlignContent()

  let txt = cell.addText(d)
  txt.font = Font.mediumSystemFont(9)
  txt.textColor = new Color("#8E8E93")
}

widget.addSpacer(1)

// SIATKA KALENDARZA
let startOffset = dayIndex(firstDay)
let totalCells = startOffset + daysInMonth
let totalRows = Math.ceil(totalCells / 7)

let dayCounter = 1

for (let row = 0; row < totalRows; row++) {
  let rowStack = widget.addStack()
  rowStack.layoutHorizontally()

  for (let col = 0; col < 7; col++) {
    let cellIndex = row * 7 + col
    let cell = rowStack.addStack()
    cell.size = new Size(CELL, 16)
    cell.centerAlignContent()

    if (cellIndex < startOffset || dayCounter > daysInMonth) {
      cell.addText(" ")
    } else {
      let currentDay = new Date(year, month, dayCounter)
      let isFuture = currentDay > today && !sameDay(currentDay, today)
      let isToday = sameDay(currentDay, today)
      let done = !isFuture && completedOnDay(currentDay)

      let dot = cell.addText(done ? "●" : "○")
      dot.font = Font.systemFont(10)

      if (isFuture) {
        dot.textColor = new Color("#3A3A3C")
      } else if (done) {
        dot.textColor = new Color("#FF453A")
      } else if (isToday) {
        dot.textColor = new Color("#8E8E93")
      } else {
        dot.textColor = new Color("#48484A")
      }

      dayCounter++
    }
  }

  widget.addSpacer(2)
}

// =========================
widget.url = "x-apple-reminderkit://"
Script.setWidget(widget)
widget.presentLarge()
Script.complete()