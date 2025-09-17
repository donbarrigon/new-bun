# New-bun

Este es un punto de partida pa’ arrancar mis proyectos con **Bun** y **MongoDB**, usando una estructura **mvc** bien organizada, con **SSR**, todo montado como a mí me gusta: sencillo y sin exceso de dependencias.

La idea es que no me toque arrancar de cero cada que vaya a montar un proyecto, sino que ya tenga la base lista pa’ empezar a meterle funcionalidad de una. 🚀

## 📥 Instalación

### 1. 🌀 Clonar el repositorio

```bash
git clone https://github.com/donbarrigon/new-bun.git name
cd name
```

### 2. 🚀 Iniciar el proyecto y descargar dependencias

Opción 1. Iniciar un proyecto limpio

```bash
bun helper init
```

Opción 2. Iniciar el proyecto como fork

```bash
bun helper init:fork
```

Si iniciaste el proyecto como un fork, puedes descargar actualizaciones con:

```bash
bun helper merge:upstream
```

⚠️ **Nota importante sobre actualizaciones**  
Los archivos que reciben soporte para la actualización son:

- `helper.ts`
- `build.ts`
- Todos los `.ts` que se llamen igual a la carpeta que los contiene

Tengalo en cuenta para evitar conflictos.

---

## 🛠️ Comandos de desarrollo

Iniciar en modo desarrollo:

```bash
bun run dev
```

Construir para producción:

```bash
bun run build
```

Ejecutar el proyecto:

```bash
bun main.ts
```

---

## Licencia

Creado con ❤️ por Don Barrigon
Distribuido bajo la [MIT License](./LICENSE).

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
