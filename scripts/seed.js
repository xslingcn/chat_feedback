const { db } = require('@vercel/postgres')
const { users, items, suggestions, qualities } = require('./demo_data')

const getStringFromBuffer = function (buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(function (b) {
      return b.toString(16).padStart(2, '0')
    })
    .join('')
}

async function createUuidExtension(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
  } catch (error) {
    console.error('Error creating uuid extension:', error)
    throw error
  }
}

async function seedUsers(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        point INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `

    console.log(`Created "users" table`)

    const insertedUsers = await Promise.all(
      users.map(async user => {
        const salt = crypto.randomUUID()

        const encoder = new TextEncoder()
        const saltedPassword = encoder.encode(user.password + salt)
        const hashedPasswordBuffer = await crypto.subtle.digest(
          'SHA-256',
          saltedPassword
        )
        const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

        return client.sql`
          INSERT INTO users (id, email, password, salt, point)
          VALUES (${user.id}, ${user.email}, ${hashedPassword}, ${salt}, ${user.point})
          ON CONFLICT (email) DO NOTHING;
        `
      })
    )

    console.log(`Seeded ${insertedUsers.length} users`)

    return {
      createTable,
      users: insertedUsers
    }
  } catch (error) {
    console.error('Error seeding users:', error)
    throw error
  }
}

async function seedItems(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY,
        parent_id UUID,
        chat_id UUID,
        text TEXT NOT NULL,
        deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        model TEXT,
        user_id UUID
      );
    `

    console.log(`Created "items" table`)

    const insertedItems = await Promise.all(
      items.map(
        item => client.sql`
      INSERT INTO items (id, parent_id, chat_id, text, deleted, created_at, model, user_id)
      VALUES (${item.id}, ${item.parent_id}, ${item.chat_id}, ${item.text}, ${item.deleted}, ${item.created_at}, ${item.model}, ${item.user_id})
      ON CONFLICT (id) DO NOTHING;
      `
      )
    )

    console.log(`Seeded ${insertedItems.length} items`)

    return {
      createTable,
      items: insertedItems
    }
  } catch (error) {
    console.error('Error seeding items:', error)
    throw error
  }
}

async function seedSuggestions(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS suggestions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        item_id UUID NOT NULL,
        text TEXT NOT NULL,
        improvements JSONB NOT NULL,
        user_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `

    console.log(`Created "suggestions" table`)

    const insertedSuggestions = await Promise.all(
      suggestions.map(
        suggestion => client.sql`
        INSERT INTO suggestions (item_id, text, improvements, user_id)
        VALUES (${suggestion.item_id}, ${suggestion.text}, ${suggestion.improvements}, ${suggestion.user_id})
        ON CONFLICT (id) DO NOTHING;
      `
      )
    )

    console.log(`Seeded ${insertedSuggestions.length} suggestions`)

    return {
      createTable,
      suggestions: insertedSuggestions
    }
  } catch (error) {
    console.error('Error seeding suggestions:', error)
    throw error
  }
}

async function seedQuality(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS qualities (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        item_id UUID NOT NULL,
        instruction BOOLEAN,
        helpful BOOLEAN,
        factual BOOLEAN,
        style BOOLEAN,
        sensitive BOOLEAN,
        toxic BOOLEAN,
        user_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `

    console.log(`Created "qualities" table`)

    const insertedQualities = await Promise.all(
      qualities.map(
        quality => client.sql`
        INSERT INTO qualities (item_id, instruction, helpful, factual, style, sensitive, toxic, user_id)
        VALUES (${quality.item_id}, ${quality.instruction}, ${quality.helpful}, ${quality.factual}, ${quality.style}, ${quality.sensitive}, ${quality.toxic}, ${quality.user_id})
        ON CONFLICT (id) DO NOTHING;
      `
      )
    )

    console.log(`Seeded ${insertedQualities.length} qualities`)

    return {
      createTable,
      qualities: insertedQualities
    }
  } catch (error) {
    console.error('Error seeding qualities:', error)
    throw error
  }
}

async function main() {
  const client = await db.connect()

  await createUuidExtension(client)
  await seedUsers(client)
  await seedItems(client)
  await seedSuggestions(client)
  await seedQuality(client)

  await client.end()
}

main().catch(err => {
  console.error('An error occurred while attempting to seed the database:', err)
})
