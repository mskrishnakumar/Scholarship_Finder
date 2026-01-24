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
