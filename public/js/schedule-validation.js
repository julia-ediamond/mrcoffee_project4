document.addEventListener("DOMContentLoaded", () => {

    //DOM elements
    const scheduleForm = documentQuerySelector('form')
    const formSubmit = document.querySelector('form button')
    const day = document.querySelector('#day')
    const startTime = document.querySelector('#starttime')
    const endTime = document.querySelector('#endtime')


    //DOM elements - alerts
    const dAlert = document.querySelector('#day + .alert')
    const startAlert = documentQuerySelector('#starttime + .alert')
    const endAlert = documentQuerySelector('#endtime + .alert')

    // validated schedule data 
    let newSchedule = {}

    // don't validate form in HTML
    scheduleForm.setAttribute("novalidate", true)

    formSubmit.onclick = event => {
        //day validation
        if (day.value === "") {
            event.preventDefault()
            dAlert = 'Please choose a day.'
            dAlert.classList.remove('hidden')
        } else {
            dAlert.classList.add('hidden')
            newSchedule.day = day.value
        }

        //start time validation
        if (startTime.value === "") {
            event.preventDefault()
            startAlert = 'Please choose your start time.'
            startAlert.classlist.remove('hidden')
        } else {
            startAlert.classList.add('hidden')
            newSchedule.startTime = startTime.value
        }

        //end time validation
        if (endTime.value === "") {
            event.preventDafault()
            endAlert = 'Please choose your end time.'
            endAlert.classlist.remove('hidden')
        } else {
            endAlert.classList.add('hidden')
            newSchedule.endTime = endTime.value
        }
    }
})
console.log(newSchedule);
