import { isEmail, isName, isNickname, isPassword, isPhoneNumber } from '../../../../utils/validations/fields'
import { post } from '../../../../utils/fetch/api'

// ==== Referencias de inputs y labels ====

const btnSignup = document.getElementById('btn-signup') as HTMLButtonElement

// ==== Función común para mostrar errores ====
function showErrors(input: HTMLInputElement, label: HTMLElement, message: string[]): boolean {
  if (message.length > 0) {
    input.classList.add('error')
    label.classList.add('error', 'active')
    let text = '<ul>'
    for (const m of message) {
      text += `<li>${m}</li>`
    }
    text += '</ul>'
    label.innerHTML = text
    return false
  } else {
    input.classList.remove('error')
    label.classList.remove('error', 'active')
    label.innerHTML = ''
    return true
  }
}

// ==== Validadores individuales ====
function validateName(): boolean {
  const name = document.getElementById('name') as HTMLInputElement
  const nameErr = document.getElementById('nameErr') as HTMLElement
  return showErrors(name, nameErr, isName(name.value))
}

function validateNickName(): boolean {
  const nickName = document.getElementById('nickname') as HTMLInputElement
  const nickNameErr = document.getElementById('nicknameErr') as HTMLElement
  return showErrors(nickName, nickNameErr, isNickname(nickName.value))
}

function validatePhone(): boolean {
  const phone = document.getElementById('phone') as HTMLInputElement
  const phoneErr = document.getElementById('phoneErr') as HTMLElement
  phoneErr.classList.remove('info')
  return showErrors(phone, phoneErr, isPhoneNumber(phone.value))
}

function validateEmail(): boolean {
  const email = document.getElementById('email') as HTMLInputElement
  const emailErr = document.getElementById('emailErr') as HTMLElement
  return showErrors(email, emailErr, isEmail(email.value))
}

function validatePassword(): boolean {
  const password = document.getElementById('password') as HTMLInputElement
  const passwordErr = document.getElementById('passwordErr') as HTMLElement
  const passwordConfirmation = document.getElementById('passwordConfirmation') as HTMLInputElement
  const passwordConfirmationErr = document.getElementById('passwordConfirmationErr') as HTMLElement
  const message = isPassword(password.value, passwordConfirmation.value)
  showErrors(password, passwordErr, message)
  return showErrors(passwordConfirmation, passwordConfirmationErr, message)
}

// ==== Enviar form ====
async function processForm() {
  if (!(validateName() && validateNickName() && validatePhone() && validateEmail() && validatePassword())) {
    return
  }
  const name = document.getElementById('name') as HTMLInputElement
  const nickName = document.getElementById('nickname') as HTMLInputElement
  const phone = document.getElementById('phone') as HTMLInputElement
  const email = document.getElementById('email') as HTMLInputElement
  const password = document.getElementById('password') as HTMLInputElement
  const passwordConfirmation = document.getElementById('passwordConfirmation') as HTMLInputElement
  const data = {
    email: email.value,
    password: password.value,
    nickname: nickName.value,
    name: name.value,
    phoneNumber: phone.value,
    passwordConfirmation: passwordConfirmation.value,
  }
  try {
    const response = await post('/api/user/store', data)

    if (response.status === 201 || response.status === 200) {
      const json = await response.json()
      console.log('Usuario creado:', json)
    } else {
      const error = await response.json()
      console.error('Error en la creación:', error)
    }
  } catch (err) {
    console.error('Error de red o servidor:', err)
  }
}

// ==== Eventos ====
;(document.getElementById('name') as HTMLInputElement).onkeyup = validateName
;(document.getElementById('nickname') as HTMLInputElement).onkeyup = validateNickName
;(document.getElementById('phone') as HTMLInputElement).onkeyup = validatePhone
;(document.getElementById('email') as HTMLInputElement).onkeyup = validateEmail
;(document.getElementById('password') as HTMLInputElement).onkeyup = validatePassword
;(document.getElementById('passwordConfirmation') as HTMLInputElement).onkeyup = validatePassword
;(document.getElementById('btn-signup') as HTMLInputElement).onclick = processForm
