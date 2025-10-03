export const env = {
  appName: Bun.env.APP_NAME ?? "MyApp",
  appDebug: Bun.env.APP_DEBUG === "true",
  serverPort: Number(Bun.env.SERVER_PORT ?? 3000),
  sessionLife: Number(Bun.env.SESSION_LIFE ?? 48 * 60) * 60 * 1000,
  dbConectionString:
    Bun.env.DB_CONNECTION_STRING ?? "mongodb://localhost:27017",
  dbName: Bun.env.DB_NAME ?? "sample_mflix",
  workerId: Number(Bun.env.WORKER_ID ?? 0),
  workerCpus: Number(Bun.env.WORKER_CPUS ?? 1),
  workerTag: [
    "[🖤 w:00]",

    // Corazones (01–08)
    "[💙 w:01]", // azul
    "[💚 w:02]", // verde
    "[💛 w:03]", // amarillo
    "[❤️  w:04]", // rojo
    "[💜 w:05]", // morado
    "[🧡 w:06]", // naranja
    "[🤍 w:07]", // blanco
    "[🤎 w:08]", // marrón

    // Círculos (09–16)
    "[🔵 w:09]", // azul
    "[🟢 w:10]", // verde
    "[🟡 w:11]", // amarillo
    "[🔴 w:12]", // rojo
    "[🟣 w:13]", // morado
    "[🟠 w:14]", // naranja
    "[⚪ w:15]", // blanco
    "[🟤 w:16]", // marrón

    // Cuadrados (17–24)
    "[🟦 w:17]", // azul
    "[🟩 w:18]", // verde
    "[🟨 w:19]", // amarillo
    "[🟥 w:20]", // rojo
    "[🟪 w:21]", // morado
    "[🟧 w:22]", // naranja
    "[⬜ w:23]", // blanco
    "[🟫 w:24]", // marrón

    // Rombos + extras (25–32)
    "[🔷 w:25]", // azul
    "[🔹 w:26]", // verde
    "[🔶 w:27]", // amarillo
    "[🔸 w:28]", // rojo
    "[♦️ w:29]", // morado
    "[🔺 w:30]", // naranja
    "[🔻 w:31]", // blanco
    "[⭐ w:32]", // marrón
  ][Number(Bun.env.WORKER_ID ?? 0)],
};
