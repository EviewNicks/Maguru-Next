/**
 * Utility untuk debugging aliran data dalam aplikasi
 */

import { ModulePage } from '../types/modulePageSchema'

/**
 * Debug level untuk mengontrol verbositas log
 */
export enum DebugLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

// Set level debug global (bisa diubah saat runtime)
let currentDebugLevel = DebugLevel.INFO

/**
 * Set level debug
 * @param level Level debug yang diinginkan
 */
export function setDebugLevel(level: DebugLevel): void {
  currentDebugLevel = level
  debugLog(`Debug level set to ${DebugLevel[level]}`, DebugLevel.INFO)
}

/**
 * Log debug dengan level tertentu
 * @param message Pesan yang akan dilog
 * @param level Level debug (default: DEBUG)
 * @param data Data tambahan untuk dilog (opsional)
 */
export function debugLog(
  message: string,
  level: DebugLevel = DebugLevel.DEBUG,
  data?: unknown
): void {
  if (level <= currentDebugLevel) {
    const prefix = `[${DebugLevel[level]}]`
    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data)
    } else {
      console.log(`${prefix} ${message}`)
    }
  }
}

/**
 * Analisis data halaman untuk debugging
 * @param pages Array halaman yang akan dianalisis
 * @returns Hasil analisis
 */
export function analyzePages(pages: ModulePage[]): {
  count: number
  titles: string[]
  statuses: Record<string, number>
  hasEmptyTitle: boolean
  duplicateTitles: string[]
} {
  const titles: string[] = []
  const statuses: Record<string, number> = {}
  const titleCounts: Record<string, number> = {}
  let hasEmptyTitle = false

  // Analisis data
  pages.forEach((page) => {
    // Periksa judul
    const title = page.title || ''
    titles.push(title)
    titleCounts[title] = (titleCounts[title] || 0) + 1

    if (!title) hasEmptyTitle = true

    // Periksa status
    const status = page.status || 'UNKNOWN'
    statuses[status] = (statuses[status] || 0) + 1
  })

  // Temukan judul duplikat
  const duplicateTitles = Object.entries(titleCounts)
    .filter(([_, count]) => count > 1)
    .map(([title]) => title)

  return {
    count: pages.length,
    titles,
    statuses,
    hasEmptyTitle,
    duplicateTitles,
  }
}

/**
 * Debug aliran data dari API ke UI
 * @param source Sumber data (misalnya 'API', 'Context', 'Component')
 * @param pages Data halaman
 */
export function debugDataFlow(source: string, pages: ModulePage[]): void {
  if (!Array.isArray(pages)) {
    console.log(`[${source}] Data is not an array: ${typeof pages}`)
    return
  }

  const analysis = analyzePages(pages)

  debugLog(
    `[DataFlow:${source}] Pages count: ${analysis.count}`,
    DebugLevel.INFO
  )

  if (analysis.count > 0) {
    debugLog(
      `[DataFlow:${source}] First page: ${JSON.stringify(pages[0])}`,
      DebugLevel.DEBUG
    )
    debugLog(
      `[DataFlow:${source}] Titles: ${analysis.titles.join(', ')}`,
      DebugLevel.DEBUG
    )
    debugLog(
      `[DataFlow:${source}] Statuses:`,
      DebugLevel.DEBUG,
      analysis.statuses
    )

    if (analysis.hasEmptyTitle) {
      debugLog(
        `[DataFlow:${source}] WARNING: Found pages with empty titles`,
        DebugLevel.WARN
      )
    }

    if (analysis.duplicateTitles.length > 0) {
      debugLog(
        `[DataFlow:${source}] WARNING: Found duplicate titles: ${analysis.duplicateTitles.join(', ')}`,
        DebugLevel.WARN
      )
    }
  }
}

/**
 * Periksa kondisi expandedItems untuk debugging
 * @param expandedItems Record expanded items
 */
export function debugExpandedItems(
  expandedItems: Record<string, boolean>
): void {
  debugLog('Current expandedItems state:', DebugLevel.DEBUG, expandedItems)

  if (!expandedItems['ModuleContent']) {
    debugLog(
      'WARNING: ModuleContent is not expanded! Pages will not be visible in sidebar.',
      DebugLevel.WARN
    )
  }
}
