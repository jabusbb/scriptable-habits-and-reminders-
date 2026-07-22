// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: check-double;
// =========================
// WEEKLY HABIT TRACKER
// =========================

const REMINDER_LIST = "Rutyny"
const DAYS = ["P","W","Ś","C","P","S","N"]


// =========================
// LOAD DATA
// =========================

let calendar = await Calendar.forRemindersByTitle(REMINDER_LIST)

// pobierz wykonane i niewykonane
let reminders = await Reminder.all([calendar], false)

let today = new Date()



// =========================
// DATE HELPERS
// =========================

function sameDay(a,b){

 return (
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()
 )

}



// =========================
// WEEK START
// =========================

let day=today.getDay()

let diff = day===0 ? -6 : 1-day

let monday=new Date(today)

monday.setDate(
 today.getDate()+diff
)

monday.setHours(
 0,0,0,0
)



// =========================
// ACTIVE HABITS
// =========================

// tylko niewykonane przypomnienia
// one są bazą listy nawyków

let activeHabits = reminders
.filter(r=>!r.isCompleted)
.map(r=>({

 title:r.title.trim(),
 notes:r.notes || ""

}))



let HABITS=[
 ...new Set(
  activeHabits.map(h=>h.title)
 )
]



// =========================
// PLAN FROM NOTES
// =========================

function plannedFromNotes(notes,date){

 if(!notes)
  return false



 // ignoruj wszystko po |
 let plan = notes
 .split("|")[0]
 .trim()
 .toLowerCase()



 // codziennie
 if(plan.startsWith("daily"))
  return true



 // format P:1,2,3
 if(plan.includes(":")){


  let numbers =
   plan
   .split(":")[1]
   .split(",")
   .map(x=>Number(x.trim()))
   .filter(x=>!isNaN(x))



  let day=date.getDay()


  return numbers.includes(day)

 }


 return false

}




// =========================
// CHECK COMPLETED
// =========================

function completedOnDay(habit,date){


 return reminders.some(r=>{


  if(r.title.trim()!==habit)
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




function plannedOnDay(habit,date){


 return activeHabits.some(h=>{


  return (
   h.title===habit &&
   plannedFromNotes(
    h.notes,
    date
   )
  )


 })


}




// =========================
// RANDOM ORDER
// =========================

function randomSeed(seed){

 return function(){

  let t=seed+=0x6D2B79F5

  t=Math.imul(
   t^t>>>15,
   t|1
  )

  t^=t+
  Math.imul(
   t^t>>>7,
   t|61
  )

  return ((t^t>>>14)>>>0)/4294967296

 }

}



let random=randomSeed(
 Number(
  `${today.getFullYear()}${today.getMonth()+1}${today.getDate()}`
 )
)



function shuffle(arr){

 for(
  let i=arr.length-1;
  i>0;
  i--
 ){

  let j=Math.floor(
   random()*(i+1)
  )

  ;[
   arr[i],
   arr[j]
  ]=[
   arr[j],
   arr[i]
  ]

 }

}



shuffle(HABITS)

HABITS=HABITS.slice(0,5)




// =========================
// WIDGET
// =========================

let widget=new ListWidget()


let gradient=new LinearGradient()

gradient.colors=[
 new Color("#111111"),
 new Color("#1c1c1e")
]

gradient.locations=[
 0,
 1
]


widget.backgroundGradient=gradient

widget.setPadding(
16,
16,
16,
16
)



const NAME_WIDTH=120
const CELL_WIDTH=26



// =========================
// HEADER
// =========================

let header=widget.addStack()

header.layoutHorizontally()


let spacer=header.addStack()

spacer.size=
new Size(
 NAME_WIDTH,
20
)



for(let d of DAYS){


 let cell=header.addStack()

 cell.size=
 new Size(
  CELL_WIDTH,
 20
 )

 cell.centerAlignContent()


 let txt=cell.addText(d)

 txt.font=
 Font.mediumSystemFont(10)

 txt.textColor=
 new Color("#8E8E93")

}



widget.addSpacer(4)



// =========================
// ROWS
// =========================

for(let habit of HABITS){


 let row=widget.addStack()

 row.layoutHorizontally()



 let nameCell=row.addStack()

 nameCell.size=
 new Size(
  NAME_WIDTH,
 24
 )

 nameCell.centerAlignContent()



 let name=nameCell.addText(habit)

 name.font=
 Font.systemFont(12)

 name.textColor=
 new Color("#8E8E93")




 for(let i=0;i<7;i++){


  let current=new Date(monday)

  current.setDate(
   monday.getDate()+i
  )



  let done=
   completedOnDay(
    habit,
    current
   )



  let planned=
   plannedOnDay(
    habit,
    current
   )



  let symbol =
   done
   ? "●"
   :
   planned
   ? "○"
   :
   "–"



  let cell=row.addStack()

  cell.size=
  new Size(
   CELL_WIDTH,
   24
  )

  cell.centerAlignContent()



  let dot=cell.addText(symbol)

  dot.font=
  Font.systemFont(10)



  dot.textColor =
   done
   ?
   new Color("#FF453A")
   :
   new Color("#48484A")


 }


 widget.addSpacer(5)

}



// =========================
// SHOW
// =========================

widget.url="x-apple-reminderkit://"

Script.setWidget(widget)

widget.presentMedium()

Script.complete()