import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from 'dotenv'

config({ path: '.env' })

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: '_migrations',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
