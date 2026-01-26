import { TableClient, TableServiceClient } from '@azure/data-tables'

interface ChatMessage {
  userId: string
  conversationId: string
  messageId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

let tableClient: TableClient | null = null

function getTableClient(): TableClient {
  if (!tableClient) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING must be set')
    }

    tableClient = TableClient.fromConnectionString(connectionString, 'ChatHistory')
  }
  return tableClient
}

export async function ensureTableExists(): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) return

  const serviceClient = TableServiceClient.fromConnectionString(connectionString)
  try {
    await serviceClient.createTable('ChatHistory')
  } catch (error: any) {
    // Table already exists - ignore
    if (error.statusCode !== 409) {
      throw error
    }
  }
}

export async function saveMessage(message: ChatMessage): Promise<void> {
  const client = getTableClient()

  await client.createEntity({
    partitionKey: `${message.userId}_${message.conversationId}`,
    rowKey: message.messageId,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    userId: message.userId,
    conversationId: message.conversationId
  })
}

export async function getConversation(
  userId: string,
  conversationId: string
): Promise<ChatMessage[]> {
  const client = getTableClient()
  const partitionKey = `${userId}_${conversationId}`

  const messages: ChatMessage[] = []
  const entities = client.listEntities({
    queryOptions: {
      filter: `PartitionKey eq '${partitionKey}'`
    }
  })

  for await (const entity of entities) {
    messages.push({
      userId: entity.userId as string,
      conversationId: entity.conversationId as string,
      messageId: entity.rowKey as string,
      role: entity.role as 'user' | 'assistant',
      content: entity.content as string,
      timestamp: entity.timestamp as string
    })
  }

  messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  return messages
}

export async function listConversations(userId: string): Promise<string[]> {
  const client = getTableClient()

  const conversationIds = new Set<string>()
  const entities = client.listEntities({
    queryOptions: {
      filter: `userId eq '${userId}'`,
      select: ['conversationId']
    }
  })

  for await (const entity of entities) {
    conversationIds.add(entity.conversationId as string)
  }

  return Array.from(conversationIds)
}

// --- Private Scholarships Table Storage ---

interface ScholarshipEntity {
  partitionKey: string
  rowKey: string
  data: string // JSON stringified scholarship
}

let privateScholarshipsClient: TableClient | null = null

function getPrivateScholarshipsClient(): TableClient {
  if (!privateScholarshipsClient) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING must be set')
    }
    privateScholarshipsClient = TableClient.fromConnectionString(connectionString, 'PrivateScholarships')
  }
  return privateScholarshipsClient
}

export async function ensurePrivateScholarshipsTableExists(): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) return

  const serviceClient = TableServiceClient.fromConnectionString(connectionString)
  try {
    await serviceClient.createTable('PrivateScholarships')
  } catch (error: any) {
    if (error.statusCode !== 409) {
      throw error
    }
  }
}

export async function savePrivateScholarshipToTable(scholarship: any): Promise<void> {
  await ensurePrivateScholarshipsTableExists()
  const client = getPrivateScholarshipsClient()

  const entity = {
    partitionKey: 'scholarship',
    rowKey: scholarship.id,
    data: JSON.stringify(scholarship)
  }

  try {
    await client.upsertEntity(entity, 'Replace')
  } catch (error) {
    console.error('Error saving scholarship to table:', error)
    throw error
  }
}

export async function loadPrivateScholarshipsFromTable(): Promise<any[]> {
  try {
    await ensurePrivateScholarshipsTableExists()
    const client = getPrivateScholarshipsClient()

    const scholarships: any[] = []
    const entities = client.listEntities({
      queryOptions: {
        filter: `PartitionKey eq 'scholarship'`
      }
    })

    for await (const entity of entities) {
      try {
        const scholarship = JSON.parse(entity.data as string)
        scholarships.push(scholarship)
      } catch {
        console.error('Failed to parse scholarship entity:', entity.rowKey)
      }
    }

    return scholarships
  } catch (error) {
    console.error('Error loading scholarships from table:', error)
    return []
  }
}

export async function deletePrivateScholarshipFromTable(id: string): Promise<boolean> {
  try {
    const client = getPrivateScholarshipsClient()
    await client.deleteEntity('scholarship', id)
    return true
  } catch (error: any) {
    if (error.statusCode === 404) {
      return false
    }
    console.error('Error deleting scholarship from table:', error)
    throw error
  }
}

// --- Embeddings Table Storage ---

let embeddingsClient: TableClient | null = null

function getEmbeddingsClient(): TableClient {
  if (!embeddingsClient) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING must be set')
    }
    embeddingsClient = TableClient.fromConnectionString(connectionString, 'Embeddings')
  }
  return embeddingsClient
}

export async function ensureEmbeddingsTableExists(): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) return

  const serviceClient = TableServiceClient.fromConnectionString(connectionString)
  try {
    await serviceClient.createTable('Embeddings')
  } catch (error: any) {
    if (error.statusCode !== 409) {
      throw error
    }
  }
}

export async function saveEmbeddingToTable(embedding: any): Promise<void> {
  await ensureEmbeddingsTableExists()
  const client = getEmbeddingsClient()

  const entity = {
    partitionKey: 'embedding',
    rowKey: embedding.id,
    data: JSON.stringify(embedding)
  }

  try {
    await client.upsertEntity(entity, 'Replace')
  } catch (error) {
    console.error('Error saving embedding to table:', error)
    throw error
  }
}

export async function loadEmbeddingsFromTable(): Promise<any[]> {
  try {
    await ensureEmbeddingsTableExists()
    const client = getEmbeddingsClient()

    const embeddings: any[] = []
    const entities = client.listEntities({
      queryOptions: {
        filter: `PartitionKey eq 'embedding'`
      }
    })

    for await (const entity of entities) {
      try {
        const embedding = JSON.parse(entity.data as string)
        embeddings.push(embedding)
      } catch {
        console.error('Failed to parse embedding entity:', entity.rowKey)
      }
    }

    return embeddings
  } catch (error) {
    console.error('Error loading embeddings from table:', error)
    return []
  }
}

export async function deleteEmbeddingFromTable(id: string): Promise<boolean> {
  try {
    const client = getEmbeddingsClient()
    await client.deleteEntity('embedding', id)
    return true
  } catch (error: any) {
    if (error.statusCode === 404) {
      return false
    }
    console.error('Error deleting embedding from table:', error)
    throw error
  }
}
