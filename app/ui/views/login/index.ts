import { appLayout } from '../../components/layout/app-layout'

export function loginPage(): string {
  return appLayout({
    title: 'Login',
    css: ['login.css'],
    slot: /*html*/ `
      <div class="login-wrapper">
        <div class="login-box">
          <h1>Ingresar</h1>
          <form>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    `,
  })
}
