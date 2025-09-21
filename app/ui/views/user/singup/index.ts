import { appLayout } from '../../../components/layout/app-layout'

export function signupPage(): string {
  return appLayout({
    title: 'Sign Up',
    css: ['../public/css/user/login.css'],
    js: ['../public/js/user/singup.js'],
    slot: /*html*/ `
      <div class="container">
        <div class="login-wrapper">
          <div class="login-box">
            <h1>Crea la cuenta</h1>
            <form>
              <label for="name">Nombre:</label>
              <input type="text" id="name" name="name">
              <label class="form-message" id="nameErr" for="name"></label>

              <label for="nickName">Nickname:</label>
              <input type="text" id="nickname" name="nickname">
              <label class="form-message" id="nicknameErr" for="nickname"></label>

              <label for="phone">Telefono:</label>
              <input type="tel" id="phone" name="phone">
              <label class="form-message info active" id="phoneErr" for="phone">Formato: +57 300 123 4567</label>

              <label for="email">Correo electronico:</label>
              <input type="email" id="email" name="email">
              <label class="form-message" id="emailErr" for="email"></label>

              <label for="password">Contraseña:</label>
              <input type="password" id="password" name="password">
              <label class="form-message" id="passwordErr" for="password"></label>

              <label for="confirmPassword">Confirma la contraseña:</label>
              <input type="password" id="passwordConfirmation" name="passwordConfirmation">
              <label class="form-message" id="passwordConfirmationErr" for="passwordConfirmationErr"></label>

              <button type="button" id="btn-signup">Registrarse</button>
            </form>
          </div>
        </div>
      </div>
    `,
  })
}
