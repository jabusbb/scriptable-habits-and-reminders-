// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: calendar-check;
// =====================================
// CLEAN MINI HABIT WIDGET
// =====================================

const REMINDER_LIST = "Rutyny"
const HABIT = args.widgetParameter || "Creatyna"


// =====================================
// LOAD REMINDERS
// =====================================

let calendar =
 await Calendar.forRemindersByTitle(
  REMINDER_LIST
 )


let allReminders =
 await Reminder.all(
  [calendar],
  true
 )


let activeReminders =
 allReminders.filter(
  r => !r.isCompleted
 )


let completedReminders =
 allReminders.filter(
  r => r.isCompleted
 )



// =====================================
// DATE
// =====================================

let today = new Date()

let year = today.getFullYear()
let month = today.getMonth()


let daysInMonth =
 new Date(
  year,
  month + 1,
  0
 ).getDate()



function sameDay(a,b){

 return (
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()
 )

}



// =====================================
// PLAN FROM ACTIVE REMINDER
// =====================================

function plannedOnDay(date){

 return activeReminders.some(r=>{


  if(
   r.title.trim() !== HABIT.trim()
  )
   return false



  let plan =
   (r.notes || "")
   .split("|")[0]
   .trim()
   .toLowerCase()



  if(
   plan.startsWith("daily")
  )
   return true



  if(
   plan.includes(":")
  ){


   let days =
    plan
    .split(":")[1]
    .split(",")
    .map(x=>Number(x.trim()))
    .filter(x=>!isNaN(x))



   let day =
    date.getDay() === 0
    ? 7
    : date.getDay()



   return days.includes(day)

  }


  return false


 })

}



// =====================================
// DONE FROM COMPLETED REMINDERS
// =====================================

function completedOnDay(date){

 return completedReminders.some(r=>{


  if(
   r.title.trim() !== HABIT.trim()
  )
   return false



  if(
   !r.completionDate
  )
   return false



  return sameDay(
   new Date(r.completionDate),
   date
  )


 })

}



// =====================================
// STREAK
// =====================================

function getCurrentStreak(){

 let streak = 0


 for(
  let i = 0;
  i < 365;
  i++
 ){

  let d = new Date()

  d.setHours(
   0,
   0,
   0,
   0
  )


  d.setDate(
   d.getDate()-i
  )



  let planned =
   plannedOnDay(d)


  let done =
   completedOnDay(d)



  // dzień poza planem
  // nie przerywa

  if(!planned)
   continue



  // wykonane

  if(done){

   streak++

  }
  else{

   break

  }

 }


 return streak

}



let streak =
 getCurrentStreak()



// =====================================
// COLORS
// =====================================

function hashString(str){

 let hash=0

 for(let i=0;i<str.length;i++){

  hash =
   str.charCodeAt(i)+
   ((hash<<5)-hash)

 }

 return Math.abs(hash)

}


function hslToHex(h,s,l){

 s/=100
 l/=100

 let k=n=>(n+h/30)%12

 let a =
  s*Math.min(l,1-l)


 let f=n=>
  l-a*Math.max(
   -1,
   Math.min(
    k(n)-3,
    Math.min(9-k(n),1)
   )
  )


 let hex=x=>
  Math.round(x*255)
  .toString(16)
  .padStart(2,"0")


 return "#"+
 hex(f(0))+
 hex(f(8))+
 hex(f(4))

}



let ACCENT =
 new Color(
  hslToHex(
   hashString(HABIT)%360,
   55,
   78
  )
 )


let BG =
 new Color("#111111")


let BG2 =
 new Color("#1C1C1E")


let DONE =
 ACCENT


let EMPTY =
 new Color("#3A3A3C")


let NO_PLAN =
 new Color("#1C1C1E")


let FUTURE =
 new Color("#2A2A2C")



// =====================================
// WIDGET
// =====================================

let widget =
 new ListWidget()


let gradient =
 new LinearGradient()


gradient.colors=[
 BG,
 BG2
]


gradient.locations=[
 0,
 1
]


widget.backgroundGradient =
 gradient


widget.setPadding(
16,
16,
16,
16
)



let title =
 widget.addText(HABIT)


title.font =
 Font.boldSystemFont(17)


title.textColor =
 Color.white()



widget.addSpacer(5)



let streakRow =
 widget.addStack()


streakRow.layoutHorizontally()

streakRow.centerAlignContent()



let fire =
 streakRow.addText("🔥")


fire.font =
 Font.systemFont(8)



streakRow.addSpacer(4)



let streakText =
 streakRow.addText(
  `${streak} day streak`
 )


streakText.font =
 Font.semiboldSystemFont(10)


streakText.textColor =
 ACCENT



widget.addSpacer(12)



// =====================================
// GRID
// =====================================

const COLS = 7
const CELL = 16
const GAP = 5


let current = 1


let rows =
 Math.ceil(
  daysInMonth / COLS
 )



for(
 let r=0;
 r<rows;
 r++
){


 let row =
  widget.addStack()


 row.layoutHorizontally()



 for(
  let c=0;
  c<COLS;
  c++
 ){


  let box =
   row.addStack()


  box.size =
   new Size(
    CELL,
    CELL
   )


  box.cornerRadius = 4



  if(
   current <= daysInMonth
  ){


   let date =
    new Date(
     year,
     month,
     current
    )



   let future =
    date > today &&
    !sameDay(
     date,
     today
    )


   let planned =
    plannedOnDay(date)


   let done =
    !future &&
    completedOnDay(date)



   if(done){

    box.backgroundColor =
     DONE

   }
   else if(future){

    box.backgroundColor =
     FUTURE

   }
   else if(planned){

    box.backgroundColor =
     EMPTY

   }
   else{

    box.backgroundColor =
     NO_PLAN


    let x =
     box.addText("×")


    x.font =
     Font.boldSystemFont(12)


    x.textColor =
     new Color("#636366")


    x.centerAlignText()

   }



   current++


  }
  else{

   box.backgroundColor =
    BG2

  }



  if(
   c < COLS-1
  )
   row.addSpacer(GAP)


 }



 if(
  r < rows-1
 )
  widget.addSpacer(GAP)

}



// =====================================

widget.url =
"x-apple-reminderkit://"


Script.setWidget(widget)

widget.presentSmall()

Script.complete()