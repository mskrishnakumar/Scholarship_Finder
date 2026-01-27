/**
 * Seed Private Scholarships Script
 *
 * Uploads private scholarships from private-scholarships.json to Azure Table Storage.
 *
 * Usage:
 *   npm run seed-private-scholarships
 *
 * Or with ts-node:
 *   npx ts-node api/src/scripts/seedPrivateScholarships.ts
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { savePrivateScholarshipToTable, ensurePrivateScholarshipsTableExists } from '../shared/tableStorage.js'

// Load .env from project root
const envPath = join(__dirname, '..', '..', '..', '.env')
const envPathAlt = join(__dirname, '..', '..', '.env')
config({ path: existsSync(envPath) ? envPath : envPathAlt })

async function main() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) {
    console.error('Error: AZURE_STORAGE_CONNECTION_STRING must be set')
    process.exit(1)
  }

  // Load private scholarships from JSON file
  const dataPath = join(__dirname, '..', '..', 'data')
  const privateScholarshipsPath = join(dataPath, 'private-scholarships.json')

  if (!existsSync(privateScholarshipsPath)) {
    console.error(`Error: Private scholarships file not found at ${privateScholarshipsPath}`)
    process.exit(1)
  }

  const privateScholarships = JSON.parse(readFileSync(privateScholarshipsPath, 'utf-8'))
  console.log(`Found ${privateScholarships.length} private scholarships to seed`)

  // Ensure table exists
  await ensurePrivateScholarshipsTableExists()
  console.log('Table ready')

  // Upload each scholarship
  let success = 0
  let failed = 0

  for (const scholarship of privateScholarships) {
    try {
      await savePrivateScholarshipToTable(scholarship)
      console.log(`  ✓ ${scholarship.name}`)
      success++
    } catch (error: any) {
      console.error(`  ✗ ${scholarship.name}: ${error.message}`)
      failed++
    }
  }

  console.log('\n--- Summary ---')
  console.log(`Total: ${privateScholarships.length}`)
  console.log(`Success: ${success}`)
  console.log(`Failed: ${failed}`)
}

main().catch(error => {
  console.error('Failed to seed private scholarships:', error)
  process.exit(1)
})
