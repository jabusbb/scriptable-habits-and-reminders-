// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: check-double;
// =========================
// WEEKLY HABIT TRACKER
// =========================

const REMINDER_LIST = "Rutyny"

const HABITS = [
  "Pushups v Squads",
  "Creatyna",
  "Italiano",
  "Jurnal",
  
]

const DAYS = ["M","T","W","T","F","S","S"]

// =========================
// LOAD DATA
// =========================

let calendar = await Calendar.forRemindersByTitle(REMINDER_LIST)
let reminders = await Reminder.all([calendar], true)

// =========================
// DATE HELPERS
// =========================

let today = new Date()

let day = today.getDay()
let diff = day === 0 ? -6 : 1 - day

let monday = new Date(today)
monday.setDate(today.getDate() + diff)
monday.setHours(0, 0, 0, 0)

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// =========================
// COMPLETION DETECTION
// isCompleted = czy wykonane
// dueDate = na kiedy było zaplanowane (dzień wykonania)
// =========================

function completedOnDay(habit, date) {
  return reminders.some(r => {
    if (r.title.trim() !== habit.trim()) return false
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
widget.setPadding(16, 16, 16, 16)

const NAME_WIDTH = 120
const CELL_WIDTH = 26

// HEADER

let header = widget.addStack()
header.layoutHorizontally()

let spacer = header.addStack()
spacer.size = new Size(NAME_WIDTH, 20)

for (let d of DAYS) {
  let cell = header.addStack()
  cell.size = new Size(CELL_WIDTH, 20)
  cell.centerAlignContent()

  let txt = cell.addText(d)
  txt.font = Font.mediumSystemFont(10)
  txt.textColor = new Color("#8E8E93")
}

widget.addSpacer(1)

// HABIT ROWS

for (let habit of HABITS) {

  let row = widget.addStack()
  row.layoutHorizontally()

  let nameCell = row.addStack()
  nameCell.size = new Size(NAME_WIDTH, 24)
  nameCell.centerAlignContent()

  let name = nameCell.addText(habit)
  name.font = Font.systemFont(12)
  name.textColor = new Color("#8E8E93")

  for (let i = 0; i < 7; i++) {
    let currentDay = new Date(monday)
    currentDay.setDate(monday.getDate() + i)

    let done = completedOnDay(habit, currentDay)

    let cell = row.addStack()
    cell.size = new Size(CELL_WIDTH, 24)
    cell.centerAlignContent()

    let dot = cell.addText(done ? "●" : "○")
    dot.font = Font.systemFont(10)
    dot.textColor = done
      ? new Color("#FF453A")
      : new Color("#48484A")
  }

  widget.addSpacer(5)
}

// =========================
widget.url = "x-apple-reminderkit://"
Script.setWidget(widget)
widget.presentMedium()
Script.complete()