import { appLayout } from "../../components/layout/app-layout"

export function homePage() {
  const listItem = (items) => {
    return /*html*/ `
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("\n")}
      </ul>
    `
  }
  return appLayout({
    title: "Home page",
    slot: /*html*/ `
      <div class="container">
        <h1>Home page</h1>
        <p>Sistema completo de estilos con tema cyberpunk y soporte para modo dark/light.</p>
        
        <h2>Elementos de prueba</h2>
        
        <h3>Texto y Enlaces</h3>
        <p>Este es un párrafo normal con <strong>texto en negrita</strong>, <em>cursiva</em> y un <a href="#">enlace con efecto hover</a>.</p>
        <small>Texto pequeño para detalles adicionales.</small>
        
        <h3>Lista</h3>
          ${listItem(["Item 1", "Item 2", "Item 3"])}
        
        <h3>Formulario</h3>
        <input type="text" placeholder="Ingresa tu texto aquí">
        <textarea placeholder="Área de texto" rows="3"></textarea>
        <button id="boton-cyberpunk">Clic aca para cambiar tema</button>
        
        <h3>Código</h3>
        <p>Código inline: <code>console.log('Hello Cyberpunk!');</code></p>
        
        <pre><code>// Bloque de código<br>
          function cyberpunkFunction() {
              return "Welcome to the future!";
          }</code></pre>
        
        <h3>Tabla</h3>
        <table>
          <thead>
            <tr>
              <th>Columna 1</th>
              <th>Columna 2</th>
              <th>Columna 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dato 1</td>
              <td>Dato 2</td>
              <td>Dato 3</td>
            </tr>
            <tr>
              <td>Dato 4</td>
              <td>Dato 5</td>
              <td>Dato 6</td>
            </tr>
          </tbody>
        </table>
        
        <blockquote>
          "En el futuro cyberpunk, la tecnología y la humanidad se fusionan en una danza de neón y sombras."
        </blockquote>
        
        <hr>
        
        <h4 class="glow">Texto con efecto glow</h4>
        <h4 class="glow-pink">Texto con glow rosa</h4>
        <h4 class="glow-green">Texto con glow verde</h4>
      </div>

      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const boton = document.getElementById("boton-cyberpunk");
          if (boton) {
            boton.addEventListener("click", () => {
              const body = document.body;
              const currentTheme = body.getAttribute("data-theme");
              const newTheme = currentTheme === "dark" ? "light" : "dark";
              body.setAttribute("data-theme", newTheme);
            });
          }
        });
      </script>
    `,
  })
}
