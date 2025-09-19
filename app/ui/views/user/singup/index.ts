import { appLayout } from '../../../components/layout/app-layout'

export function signupPage(): string {
  return appLayout({
    title: 'Sign Up',
    css: ['../public/css/login.css'],
    slot: /*html*/ `
      <div class="container">
        <div class="login-wrapper">
          <div class="login-box">
            <h1>Crea la cuenta</h1>
            <form>
              <label for="name">Nombre:</label>
              <input type="text" id="name" name="name">

              <label for="nickName">Nickname:</label>
              <input type="text" id="nickName" name="nickName">

              <label for="phone">Telefono:</label>
              <input type="tel" id="phone" name="phone">

              <label for="email">Correo electronico:</label>
              <input type="email" id="email" name="email">

              <label for="password">Contraseña:</label>
              <input type="password" id="password" name="password">

              <label for="confirmPassword">Confirma la contraseña:</label>
              <input type="password" id="confirmPassword" name="confirmPassword">

              <button type="submit">Registrarse</button>
            </form>
          </div>
        </div>
      </div>
    `,
  })
}
