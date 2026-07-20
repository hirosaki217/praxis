import { seedData, type SeedData } from './seed'

const KEY = 'pizzaforge:db:v1'
type DB = SeedData

function hydrate(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* bỏ qua, fallback seed */
  }
  return structuredClone(seedData)
}

let db: DB = hydrate()

export const getDB = (): DB => db
export function persist(): void {
  localStorage.setItem(KEY, JSON.stringify(db))
}
export function resetSeed(): DB {
  db = structuredClone(seedData)
  persist()
  return db
}
