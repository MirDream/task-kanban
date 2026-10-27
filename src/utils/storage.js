/**
 * localStorage 读写工具
 * - 读：任何异常（无数据 / JSON 损坏 / 结构非法）一律降级为 null，由上层回落默认状态
 * - 写：配额超限或隐私模式禁用时静默失败，不阻断交互
 */
const STORAGE_KEY = 'task-kanban.v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    if (!Array.isArray(data.tasks)) return null
    return data
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export { STORAGE_KEY }
