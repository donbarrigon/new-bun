/**
 *
 * @param {string} html - Cadena de HTML
 * @returns {Response} Respuesta HTTP
 */
export function view(html) {
  return new Response(
    html
      .replace(/<!--.*?-->/gs, '') // elimina comentarios
      .replace(/\s{2,}/g, ' ') // convierte espacios múltiples en uno
      .replace(/\n/g, '') // elimina saltos de línea
      .replace(/>([^<]+)</g, (_, content) => `>${content.trim()}<`) // recorta contenido dentro de etiquetas
      .trim(),
    {
      headers: { 'Content-Type': 'text/html' },
    }
  )
}
