export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  if (magnitude === 0) return 0

  return dotProduct / magnitude
}

export interface EmbeddingRecord {
  id: string
  embedding: number[]
}

export function findTopK(
  queryEmbedding: number[],
  embeddings: EmbeddingRecord[],
  k: number = 5
): Array<{ id: string; score: number }> {
  const scored = embeddings.map(record => ({
    id: record.id,
    score: cosineSimilarity(queryEmbedding, record.embedding)
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, k)
}
