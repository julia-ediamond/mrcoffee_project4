document.addEventListener("DOMContentLoaded", () => {
  //DOM elements
  const signupForm = document.querySelector('.form')
  const formSubmit = document.querySelector('.form button')
  const firstName = document.querySelector('#firstname')
  const lastName = document.querySelector('#lastname')
  const email = document.querySelector('#email')
  const password = document.querySelector('#password')
  const confirmPassword = document.querySelector('#confirm-password')

  // DOM elements - alerts
  const fnAlert = document.querySelector('#firstname + .alert')
  const lnAlert = document.querySelector('#lastname + .alert')
  const eAlert = document.querySelector('#email + .alert')
  const pAlert = document.querySelector('#password + .alert')
  const cpAlert = document.querySelector('#confirm-password + .alert')

  // Validated user data
  let user = {}

  // don't validate form in HTML
  signupForm.setAttribute("novalidate", true)

  formSubmit.onclick = event => {
    // first name validation
    if (firstName.value === "") {
      event.preventDefault()
      fnAlert.innerHTML = 'Please enter your first name.'
      fnAlert.classList.remove('hidden')
    } else if (/^([A-Za-zÀ-ÖØ-öø-ÿ])+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+$/.test(firstName.value) !== true) {
      event.preventDefault()
      fnAlert.innerHTML = 'Please only use letters, spaces and hyphens.'
      fnAlert.classList.remove('hidden')
    } else {
      fnAlert.classList.add('hidden')
      user.firstname = firstName.value
    }


    // last name validation
    if (lastName.value === "") {
      event.preventDefault()
      lnAlert.innerHTML = 'Please enter your last name.'
      lnAlert.classList.remove('hidden')
    } else if (/^([A-Za-zÀ-ÖØ-öø-ÿ])+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+( |-)?([A-Za-zÀ-ÖØ-öø-ÿ?]?)+$/.test(lastName.value) !== true) {
      event.preventDefault()
      lnAlert.innerHTML = 'Please only use letters, spaces and hyphens.'
      lnAlert.classList.remove('hidden')
    } else {
      lnAlert.classList.add('hidden')
      user.lastname = lastName.value
    }


    // email validation - regex courtesy of Tripleaxis
    if (email.value === '') {
      event.preventDefault()
      eAlert.innerHTML = 'Email required.'
      eAlert.classList.remove('hidden')
    } else if (/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(email.value) !== true) {
      event.preventDefault()
      eAlert.innerHTML = 'Please use a valid email address.'
      eAlert.classList.remove('hidden')
    } else {
      eAlert.classList.add('hidden')
      user.email = email.value
    }



    // password validation - regex courtesy of psutton3756
    if (password.value === '') {
      event.preventDefault()
      pAlert.innerHTML = 'Password required.'
      pAlert.classList.remove('hidden')
    } else if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(password.value) !== true) {
      event.preventDefault()
      pAlert.innerHTML = 'Please choose a valid password.'
      pAlert.classList.remove('hidden')
    }
    else {
      pAlert.classList.add('hidden')
    }

    // confirm matching passwords
    if (password.value !== confirmPassword.value) {
      event.preventDefault()
      cpAlert.innerHTML = "Passwords don't match."
      cpAlert.classList.remove('hidden')
      console.log('Passwords dont match')
    } else {
      cpAlert.classList.add('hidden')
    }
  }
})