const users = [
  {
    id: '5f551270-968f-4669-8065-f9c72ea6613b',
    email: 'demo1@xsl.ing',
    password: 'password1',
    point: 20
  },
  {
    id: 'fc25fb8f-4ff6-48f4-974f-06f9999a5bf0',
    email: 'demo2@xsl.ing',
    password: 'password2',
    point: 3
  }
]

now = new Date()

const items = [
  {
    id: 'e17b284b-e4f3-41db-a219-01e55fe39090',
    parent_id: null,
    chat_id: 'ac788d05-1ff7-41f0-b9a6-ea2273a64e74',
    text: 'This is the first message, a root item.',
    created_at: now.toISOString(),
    deleted: false,
    model: null,
    user_id: '5f551270-968f-4669-8065-f9c72ea6613b'
  },
  {
    id: '53124750-80ae-43c8-b3cc-f46672557fbb',
    parent_id: 'e17b284b-e4f3-41db-a219-01e55fe39090',
    chat_id: 'ac788d05-1ff7-41f0-b9a6-ea2273a64e74',
    text: 'This is a reply message.',
    created_at: new Date(now.getTime() + 1000).toISOString(),
    deleted: false,
    model: 'meta-llama-3-70b-instruct',
    user_id: null
  },
  {
    id: '317b42d1-1956-4a14-985e-6b7c1b09262d',
    parent_id: '53124750-80ae-43c8-b3cc-f46672557fbb',
    chat_id: 'ac788d05-1ff7-41f0-b9a6-ea2273a64e74',
    text: 'I replied to the reply message.',
    created_at: new Date(now.getTime() + 3000).toISOString(),
    deleted: false,
    model: null,
    user_id: '5f551270-968f-4669-8065-f9c72ea6613b'
  }
]

const suggestions = [
  {
    item_id: '53124750-80ae-43c8-b3cc-f46672557fbb',
    text: 'This is a better response.',
    improvements: {
      instruction: true,
      helpful: true,
      factual: false,
      style: true,
      sensitive: false,
      toxic: false
    },
    user_id: '5f551270-968f-4669-8065-f9c72ea6613b'
  }
]

const qualities = [
  {
    item_id: '53124750-80ae-43c8-b3cc-f46672557fbb',
    instruction: true,
    helpful: true,
    factual: true,
    style: true,
    sensitive: false,
    toxic: false,
    user_id: '5f551270-968f-4669-8065-f9c72ea6613b'
  }
]

module.exports = {
  users,
  items,
  suggestions,
  qualities
}
