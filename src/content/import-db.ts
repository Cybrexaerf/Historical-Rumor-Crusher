import { openDB, type IDBPDatabase } from 'idb'
import type { EntryMeta } from './schema.ts'

export interface ImportRecord {
  meta: EntryMeta
  bodyHtml: string
  rawMd: string
  importedAt: string
}

const DB_NAME = 'rumor-archive'
const STORE = 'entries'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'meta.id' })
        }
      }
    })
  }
  return dbPromise
}

export async function getAllImports(): Promise<ImportRecord[]> {
  try {
    const db = await getDb()
    return (await db.getAll(STORE)) as ImportRecord[]
  } catch {
    return []
  }
}

export async function putImport(record: ImportRecord): Promise<void> {
  const db = await getDb()
  await db.put(STORE, record)
}

export async function deleteImport(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, id)
}

export async function clearImports(): Promise<void> {
  const db = await getDb()
  await db.clear(STORE)
}
