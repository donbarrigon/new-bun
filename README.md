# New-bun

Este es un punto de partida pa’ arrancar proyectos con **Bun** y **MongoDB**, usando una estructura **MVC** bien organizada, con **SSR** y el **patrón Repository**, todo montado como a mí me gusta: sencillo, práctico y sin dependencias.

La idea es que no te toque arrancar de cero cada que vas a montar un proyecto, sino que ya tengas la base lista pa’ empezar a meterle funcionalidad de una. 🚀

## 📥 Instalación

### 1. 🌀 Clonar el repositorio

```bash
git clone https://github.com/donbarrigon/new-bun.git projectName
cd projectName
```

### 2. 🚀 Iniciar el proyecto y descargar dependencias

Opción 1. Iniciar un proyecto limpio

```bash
bun helper init
```

Opción 2. Iniciar el proyecto como fork

```bash
bun helper fork
```

Si iniciaste el proyecto como un fork, puedes descargar actualizaciones con:

```bash
bun helper update
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
