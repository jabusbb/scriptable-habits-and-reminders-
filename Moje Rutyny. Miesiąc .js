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

// pobierz wykonane i niewykonane
let reminders = await Reminder.all([calendar], false)


// =========================
// DATE HELPERS
// =========================

let today = new Date()

let year = today.getFullYear()
let month = today.getMonth()

let firstDay = new Date(year, month, 1)
let daysInMonth = new Date(year, month + 1, 0).getDate()


function dayIndex(date){

 let d = date.getDay()

 return d === 0 ? 6 : d - 1

}


function sameDay(a,b){

 return (
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()
 )

}



// =========================
// NOTES PARSER
// =========================

function plannedFromNotes(notes,date){

 if(!notes)
  return false


 // ignoruj opis po |
 let plan = notes
 .split("|")[0]
 .trim()
 .toLowerCase()


 // codziennie
 if(plan.startsWith("daily"))
  return true



 // format P:1,2,3
 if(plan.includes(":")){


  let days =
   plan
   .split(":")[1]
   .split(",")
   .map(x=>Number(x.trim()))
   .filter(x=>!isNaN(x))


  // JS:
  // 1 poniedziałek
  // 2 wtorek
  // ...
  // 0 niedziela

  return days.includes(
   date.getDay()
  )

 }


 return false

}



// =========================
// CHECK PLANNED
// =========================

function plannedOnDay(date){

 return reminders.some(r=>{


  if(r.title.trim() !== HABIT.trim())
   return false


  return plannedFromNotes(
   r.notes || "",
   date
  )


 })

}



// =========================
// CHECK COMPLETED
// =========================

function completedOnDay(date){

 return reminders.some(r=>{


  if(r.title.trim() !== HABIT.trim())
   return false


  if(!r.isCompleted)
   return false


  if(!r.completionDate)
   return false



  return sameDay(
   new Date(r.completionDate),
   date
  )


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

gradient.locations = [
 0,
 1
]


widget.backgroundGradient = gradient

widget.setPadding(
14,
30,
14,
14
)



const DAYS = [
"M",
"T",
"W",
"T",
"F",
"S",
"S"
]


const WIDGET_WIDTH = 338
const PADDING = 48
const CELL = Math.floor(
 (WIDGET_WIDTH - PADDING) / 7
)



// TYTUŁ

let titleTxt = widget.addText(HABIT)

titleTxt.font =
 Font.boldSystemFont(10)

titleTxt.textColor =
 Color.white()



widget.addSpacer(1)



// MIESIĄC

let df = new DateFormatter()

df.dateFormat = "LL yyyy"


let monthTxt =
 widget.addText(
  df.string(today)
 )


monthTxt.font =
 Font.systemFont(18)

monthTxt.textColor =
 new Color("#8E8E93")



widget.addSpacer(1)



// HEADER

let header = widget.addStack()

header.layoutHorizontally()



for(let d of DAYS){


 let cell = header.addStack()

 cell.size =
 new Size(
  CELL,
 16
 )

 cell.centerAlignContent()



 let txt = cell.addText(d)

 txt.font =
 Font.mediumSystemFont(9)

 txt.textColor =
 new Color("#8E8E93")

}



widget.addSpacer(1)



// =========================
// CALENDAR GRID
// =========================

let startOffset = dayIndex(firstDay)

let totalCells = startOffset + daysInMonth

let totalRows = Math.ceil(
 totalCells / 7
)


let dayCounter = 1



for(let row = 0; row < totalRows; row++){


 let rowStack = widget.addStack()

 rowStack.layoutHorizontally()



 for(let col = 0; col < 7; col++){


  let cellIndex = row * 7 + col


  let cell = rowStack.addStack()

  cell.size =
  new Size(
   CELL,
   16
  )

  cell.centerAlignContent()



  if(
   cellIndex < startOffset ||
   dayCounter > daysInMonth
  ){


   cell.addText(" ")


  }
  else{


   let currentDay =
    new Date(
     year,
     month,
     dayCounter
    )



   let isFuture =
    currentDay > today &&
    !sameDay(
     currentDay,
     today
    )



   let isToday =
    sameDay(
     currentDay,
     today
    )



   let planned =
    plannedOnDay(
     currentDay
    )



   let done =
    !isFuture &&
    completedOnDay(
     currentDay
    )



   let symbol =
    done
    ? "●"
    :
    planned
    ? "○"
    :
    "–"



   let dot =
    cell.addText(symbol)



   dot.font =
    Font.systemFont(10)



   if(isFuture){

    dot.textColor =
     new Color("#3A3A3C")

   }
   else if(done){

    dot.textColor =
     new Color("#FF453A")

   }
   else if(planned){

    dot.textColor =
     new Color("#48484A")

   }
   else {

    dot.textColor =
     new Color("#2C2C2E")

   }



   dayCounter++

  }


 }


 widget.addSpacer(2)

}



// =========================
// SHOW
// =========================

widget.url =
"x-apple-reminderkit://"


Script.setWidget(widget)

widget.presentLarge()

Script.complete()