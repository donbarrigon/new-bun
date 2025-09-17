import { appLayout } from '../../components/appLayout.ts'

interface Props {}
export const homePage = () => {
  return appLayout({
    title: 'Home page',
    slot: /*html*/ `
      <h1>Home page</h1>
      <p>contenido de la pagina de inicio</p>
    `,
  })
}

// retorna los archivos de la carpeta public
