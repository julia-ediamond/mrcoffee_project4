document.addEventListener("DOMContentLoaded", () => {

    //DOM elements
    const scheduleForm = document.querySelector('.form')
    const formSubmit = document.querySelector('.form button')
    const day = document.querySelector('#day')
    const startTime = document.querySelector('#start_time')
    const endTime = document.querySelector('#end_time')


    //DOM elements - alerts
    const dAlert = document.querySelector('#day + .alert')
    const startAlert = document.querySelector('#start_time + .alert')
    const endAlert = document.querySelector('#end_time + .alert')

    // validated schedule data 
    let newSchedule = {}

    // don't validate form in HTML
    scheduleForm.setAttribute("novalidate", true)

    formSubmit.onclick = event => {
        //day validation
        if (day.value === "") {
            event.preventDefault()
            dAlert.innerHTML = 'Please choose a day.'
            dAlert.classList.remove('hidden')
        } else {
            dAlert.classList.add('hidden')
            newSchedule.day = day.value
        }

        //start time validation
        if (startTime.value === "") {
            event.preventDefault()
            startAlert.innerHTML = 'Please choose your start time.'
            startAlert.classList.remove('hidden')
        } else if (/^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/.test(startTime.value) === false) {
            event.preventDefault()
            startAlert.innerHTML = 'Please choose HH:MM format.'
            startAlert.classList.remove('hidden')
        } else {
            startAlert.classList.add('hidden')
            newSchedule.startTime = startTime.value
        }


        //end time validation
        if (endTime.value === "") {
            event.preventDefault()
            endAlert.innerHTML = 'Please choose your end time.'
            endAlert.classList.remove('hidden')
        } else if (/^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/.test(endTime.value) === false) {
            event.preventDefault()
            endAlert.innerHTML = 'Please choose HH:MM format.'
            endAlert.classList.remove('hidden')
        } else if (Number(endTime.value.replace(':', '')) <= Number(startTime.value.replace(':', ''))) {
            event.preventDefault()
            endAlert.innerHTML = 'Your end time should be later than your start time.'
            endAlert.classList.remove('hidden')
        }
        else {
            endAlert.classList.add('hidden')
            newSchedule.endTime = endTime.value
        } console.log(newSchedule);
    }
})

