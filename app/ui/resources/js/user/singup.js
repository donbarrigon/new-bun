import { isEmail, isName, isNickname, isPassword, isPhoneNumber } from "../../../../utils/validations/validations"

import { post } from "../../../../utils/fetch/msgpack.js"

// ==== Referencias de inputs y labels ====

const btnSignup = document.getElementById("btn-signup")

// ==== Función común para mostrar errores ====
function showErrors(input, label, message) {
  if (message.length > 0) {
    input.classList.add("error")
    label.classList.add("error", "active")
    let text = "<ul>"
    for (const m of message) {
      text += `<li>${m}</li>`
    }
    text += "</ul>"
    label.innerHTML = text
    return false
  } else {
    input.classList.remove("error")
    label.classList.remove("error", "active")
    label.innerHTML = ""
    return true
  }
}

// ==== Validadores individuales ====
function validateName() {
  const name = document.getElementById("name")
  const nameErr = document.getElementById("nameErr")
  return showErrors(name, nameErr, isName(name.value))
}

function validateNickName() {
  const nickName = document.getElementById("nickname")
  const nickNameErr = document.getElementById("nicknameErr")
  return showErrors(nickName, nickNameErr, isNickname(nickName.value))
}

function validatePhone() {
  const phone = document.getElementById("phone")
  const phoneErr = document.getElementById("phoneErr")
  phoneErr.classList.remove("info")
  return showErrors(phone, phoneErr, isPhoneNumber(phone.value))
}

function validateEmail() {
  const email = document.getElementById("email")
  const emailErr = document.getElementById("emailErr")
  return showErrors(email, emailErr, isEmail(email.value))
}

function validatePassword() {
  const password = document.getElementById("password")
  const passwordErr = document.getElementById("passwordErr")
  const passwordConfirmation = document.getElementById("passwordConfirmation")
  const passwordConfirmationErr = document.getElementById("passwordConfirmationErr")
  const message = isPassword(password.value, passwordConfirmation.value)
  showErrors(password, passwordErr, message)
  return showErrors(passwordConfirmation, passwordConfirmationErr, message)
}

// ==== Enviar form ====
async function processForm() {
  if (!(validateName() && validateNickName() && validatePhone() && validateEmail() && validatePassword())) {
    return
  }
  const name = document.getElementById("name")
  const nickName = document.getElementById("nickname")
  const phone = document.getElementById("phone")
  const email = document.getElementById("email")
  const password = document.getElementById("password")
  const passwordConfirmation = document.getElementById("passwordConfirmation")
  const data = {
    email: email.value,
    password: password.value,
    nickname: nickName.value,
    name: name.value,
    phoneNumber: phone.value,
    passwordConfirmation: passwordConfirmation.value,
  }
  try {
    const response = await post("/api/user/store", data)

    if (response.status === 201 || response.status === 200) {
      const json = await response.json()
      console.log("Usuario creado:", json)
    } else {
      const error = await response.json()
      console.error("Error en la creación:", error)
    }
  } catch (err) {
    console.error("Error de red o servidor:", err)
  }
}

// ==== Eventos ====
document.getElementById("name").onkeyup = validateName
document.getElementById("nickname").onkeyup = validateNickName
document.getElementById("phone").onkeyup = validatePhone
document.getElementById("email").onkeyup = validateEmail
document.getElementById("password").onkeyup = validatePassword
document.getElementById("passwordConfirmation").onkeyup = validatePassword
document.getElementById("btn-signup").onclick = processForm
