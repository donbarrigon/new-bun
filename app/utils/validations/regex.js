export const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9\s\-()]+$/,
  userName: /^[a-zA-Z][a-zA-Z0-9._]*$/,
  personalName: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+([ '-][A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/,
  alphaSpacesAcents: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/,
}
