'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'
import { sql } from '@vercel/postgres'

import { auth } from '@/auth'
import { CardData, Message, Quality, type Chat } from '@/lib/types'
import { CoreAssistantMessage, CoreUserMessage } from 'ai'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChatsSQL(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    const chatDetailsPromises = chats.map(async chatKey =>
      getChatSQL(chatKey.split(':')[1], userId)
    )

    const results = await Promise.all(chatDetailsPromises)
    const fulfilled = results.filter(result => result !== null)

    return fulfilled
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function getChatSQL(id: string, userId: string) {
  const items = await sql`
        SELECT * FROM items WHERE chat_id = ${id} ORDER BY created_at ASC
      `
  const messages = items.rows.map(
    item =>
      ({
        id: item.id,
        content: item.text,
        role: item.model ? 'assistant' : 'user'
      }) as (CoreAssistantMessage | CoreUserMessage) & { id: string }
  )

  if (messages.length === 0) {
    return null
  }

  const title = items.rows[0].text.slice(0, 100)
  const createdAt = new Date(items.rows[0].created_at)

  const chat: Chat = {
    id: id,
    title: title,
    createdAt: createdAt,
    userId: userId,
    path: `/chat/${id}`,
    messages: messages
  }

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function removeChatSQL({
  id,
  path
}: {
  id: string
  path: string
}) {
  const session = await auth()

  if (!session || !session.user || !session.user.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const items = await sql`
        SELECT * FROM items 
        WHERE chat_id = ${id} AND user_id = ${session.user.id} 
        ORDER BY created_at ASC 
        LIMIT 1;
      `
  if (items.rows.length === 0) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)
  await sql`
    UPDATE items
    SET deleted = true
    WHERE chat_id = ${id};
  `

  revalidatePath('/')
  return revalidatePath(path)
}

// export async function clearChats() {
//   const session = await auth()

//   if (!session?.user?.id) {
//     return {
//       error: 'Unauthorized'
//     }
//   }

//   const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
//   if (!chats.length) {
//     return redirect('/')
//   }
//   const pipeline = kv.pipeline()

//   for (const chat of chats) {
//     pipeline.del(chat)
//     pipeline.zrem(`user:chat:${session.user.id}`, chat)
//   }

//   await pipeline.exec()

//   revalidatePath('/')
//   return redirect('/')
// }

// export async function saveChat(chat: Chat) {
//   const session = await auth()

//   if (session && session.user) {
//     console.log('chat', chat)
//     const pipeline = kv.pipeline()
//     pipeline.hmset(`chat:${chat.id}`, chat)
//     pipeline.zadd(`user:chat:${chat.userId}`, {
//       score: Date.now(),
//       member: `chat:${chat.id}`
//     })
//     await pipeline.exec()
//   } else {
//     return
//   }
// }

export async function saveChatSQL(chat: Chat) {
  const session = await auth()

  if (session && session.user && chat.messages.length > 0) {
    const isFirstMessage = chat.messages.length === 1
    const message = chat.messages[chat.messages.length - 1]
    const parent_message = isFirstMessage
      ? null
      : chat.messages[chat.messages.length - 2]

    if (!(typeof message.content === 'string')) {
      return
    } // TODO: check content type

    const item = {
      id: message.id,
      parent_id: parent_message?.id,
      chat_id: chat.id,
      text: message.content,
      created_at: new Date().toISOString(),
      deleted: false,
      model: message.role === 'assistant' ? 'gpt-4o-2024-05-13' : null,
      user_id: message.role === 'user' ? chat.userId : null
    }

    try {
      // Save chat history to KV
      const pipeline = kv.pipeline()
      pipeline.zadd(`user:chat:${chat.userId}`, {
        score: Date.now(),
        member: `chat:${chat.id}`
      })
      await pipeline.exec()

      // Save chat items to SQL
      await sql`
      INSERT INTO items (id, parent_id, chat_id, text, deleted, created_at, model, user_id)
      VALUES (${item.id}, ${item.parent_id}, ${item.chat_id}, ${item.text}, ${item.deleted}, ${item.created_at}, ${item.model}, ${item.user_id})
      `
    } catch (error) {
      return {
        error: 'Database Error: Failed to Save Chat.'
      }
    }
  }
}

export async function saveQuality(quality: Quality) {
  const session = await auth()

  if (!session || !session.user || !session.user.id) {
    return {
      error: 'Unauthorized'
    }
  }
  const user_id = session.user.id
  try {

    const res = await sql`
      SELECT EXISTS (
        SELECT 1
        FROM qualities
        WHERE user_id = ${session.user.id} AND item_id = ${quality.item_id}
    );
    `
    if (res.rows[0].exists) {
      return {
        failure: 'You already submitted feedback for this message.'
      }
    }

    // Save quality to SQL
    await sql`
        INSERT INTO qualities (item_id, instruction, helpful, factual, style, sensitive, toxic, user_id)
        VALUES (${quality.item_id}, ${quality.instruction}, ${quality.helpful}, ${quality.factual}, ${quality.style}, ${quality.sensitive}, ${quality.toxic}, ${user_id});
      `

    return {
      success: 'Feedback submitted.'
    }
  } catch (error) {
    return {
      error: 'Database Error: Failed to Save Quality.'
    }
  }
}

export async function getAnnotatedIDs(chatId: string, messages: Message[]) {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return {
        error: 'Unauthorized'
      }
    }

    const items = await sql`
      SELECT * FROM qualities WHERE user_id = ${session.user.id};
    `

    const messageIds = messages.map(message => message.id);
    const annotated = items.rows.filter(item => messageIds.includes(item.item_id));
    const annotatedIds = annotated.map(item => item.item_id);

    return annotatedIds;
  } catch (error) {

    return {
      error: 'Database Error: Failed to Get Annotated Item.'
    }
  }
}

export async function getPublicCardData() {
  try {
    const totalChats =
      await sql`SELECT COUNT(DISTINCT id) AS distinct_chat_count FROM items WHERE deleted = false;`
    const qualities = await sql`SELECT COUNT(*) AS total_count FROM qualities;`
    const suggestions =
      await sql`SELECT COUNT(*) AS total_count FROM suggestions;`

    const data: CardData = {
      totalChats: totalChats.rows[0].distinct_chat_count,
      qualities: qualities.rows[0].total_count,
      suggestions: suggestions.rows[0].total_count,
      feedbackByYou: null
    }
    return data
  } catch (error) {
    return {
      error: 'Database Error: Failed to Get Card Data.'
    }
  }
}

export async function getFeedbackByYou(userId: string) {
  try {
    const feedbackByYou = await sql`SELECT
    (SELECT COUNT(*) FROM suggestions WHERE user_id = ${userId}) +
    (SELECT COUNT(*) FROM qualities WHERE user_id = ${userId}) AS total_count`

    return feedbackByYou?.rows[0]?.total_count
  } catch (error) {
    return {
      error: 'Database Error: Failed to Get Card Data.'
    }
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
