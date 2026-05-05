const { Client } = require('pg')
require('dotenv').config({ path: `${__dirname}/../.env` })

async function createDatabase() {
  const dbUrl = new URL(process.env.DATABASE_URL)
  
  // Si es una base de datos en la nube como Neon, saltamos la creación automática
  if (dbUrl.hostname.includes('neon.tech')) {
    console.log('ℹ Conexión a Neon detectada. Saltando creación de base de datos automática.');
    return;
  }

  const dbName = dbUrl.pathname.slice(1)
  const adminDbUrl = new URL(process.env.DATABASE_URL)
  adminDbUrl.pathname = '/postgres'

  const client = new Client({
    connectionString: adminDbUrl.toString(),
  })

  try {
    await client.connect()
    
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    )

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`)
      console.log(`✓ Database "${dbName}" created successfully`)
    } else {
      console.log(`ℹ Database "${dbName}" already exists`)
    }
  } catch (error) {
    console.error('✗ Error creating database:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

createDatabase()
