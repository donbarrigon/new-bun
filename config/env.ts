export const env = {
  appName: Bun.env.APP_NAME ?? 'MyApp',
  appDebug: Bun.env.APP_DEBUG === 'true',
  serverPort: Number(Bun.env.SERVER_PORT ?? 3000),
  dbConectionString: Bun.env.DB_CONNECTION_STRING ?? 'mongodb://localhost:27017',
  dbName: Bun.env.DB_NAME ?? 'sample_mflix',
}
