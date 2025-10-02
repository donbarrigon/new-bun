/**
 *
 * @param {string} name
 * @returns {string}
 */
export function toNameCase(name) {
  const lowercaseWords = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'en', 'el', 'a', 'un', 'una'])

  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index > 0 && lowercaseWords.has(word)) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
