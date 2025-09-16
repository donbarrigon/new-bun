export const env = {
  appName: Bun.env.APP_NAME ?? 'tsApp',
  serverPort: Number(Bun.env.PORT ?? 3000),
  dbConectionString:
    Bun.env.DB_CONNECTION_STRING ?? 'mongodb://localhost:27017',
  dbName: Bun.env.DB_NAME ?? 'sample_mflix',
}
