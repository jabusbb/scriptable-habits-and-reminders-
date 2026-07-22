// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
//=====================================
// MINIMAL HABIT TIMER
// Parametr:
// FastFood|fork.knife.circle.fill|No junk food
//=====================================

const REMINDER_LIST = "Rutyny"

const parts = (args.widgetParameter ||
"fastfood|fork.knife|No junk food").split("|")

const REMINDER = parts[0]
const ICON = parts[1] || "clock.fill"
const LABEL = parts[2] || REMINDER

//=====================================
// COLORS
//=====================================

const BG1 = new Color("#18231F")
const BG2 = new Color("#111614")
const ACCENT = new Color("#B8F2EB")
const TITLE = new Color("#DCE3E0")

//=====================================
// LOAD REMINDERS
//=====================================

const calendar = await Calendar.forRemindersByTitle(REMINDER_LIST)
const reminders = await Reminder.all([calendar], true)

//=====================================
// LAST COMPLETED
//=====================================

const last = reminders
.filter(r =>
    r.isCompleted &&
    r.title.trim().toLowerCase() ==
    REMINDER.trim().toLowerCase() &&
    r.dueDate
)
.sort((a,b)=>
    new Date(b.dueDate)-new Date(a.dueDate)
)[0]

//=====================================
// FORMAT
//=====================================

function elapsed(date){

    let sec = Math.floor((Date.now()-date.getTime())/1000)

    if(sec < 0) sec = 0

    const d = Math.floor(sec/86400)
    const h = Math.floor((sec%86400)/3600)
    const m = Math.floor((sec%3600)/60)
    const s = sec%60

    if(d>0){
        return {
            big:`${d}d`,
            small:`${h} hours`
        }
    }

    if(h>0){
        return{
            big:`${h}h`,
            small:`${m} minutes`
        }
    }

    return{
        big:`${m}m`,
        small:`${s} seconds`
    }
}

//=====================================
// WIDGET
//=====================================

let widget = new ListWidget()

let gradient = new LinearGradient()
gradient.colors=[BG1,BG2]
gradient.locations=[0,1]

widget.backgroundGradient = gradient
widget.setPadding(18,18,18,18)

widget.refreshAfterDate =
new Date(Date.now()+60000)

//=====================================
// ICON
//=====================================

let img = widget.addImage(
SFSymbol.named(ICON).image
)

img.tintColor = ACCENT
img.imageSize = new Size(28,28)

widget.addSpacer(5)

//=====================================
// TITLE
//=====================================

let title = widget.addText("⊘ " + LABEL)
title.font = Font.semiboldSystemFont(10)
title.textColor = TITLE

widget.addSpacer(10)

//=====================================
// TIME
//=====================================

if(last){

    const t = elapsed(new Date(last.dueDate))

    let big = widget.addText(t.big)
    big.font = Font.boldRoundedSystemFont(56)
    big.textColor = ACCENT

    widget.addSpacer(2)

    let small = widget.addText(t.small)
    small.font = Font.mediumSystemFont(17)
    small.textColor = TITLE

}else{

    let big = widget.addText("--")
    big.font = Font.boldRoundedSystemFont(56)
    big.textColor = ACCENT

    widget.addSpacer(2)

    let small = widget.addText("No data")
    small.font = Font.mediumSystemFont(17)
    small.textColor = TITLE

}

widget.url = "x-apple-reminderkit://"

Script.setWidget(widget)
widget.presentSmall()
Script.complete()