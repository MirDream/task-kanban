import { ref, computed, watch } from 'vue'
import { loadState, saveState } from '../utils/storage'

export const COLUMNS = [
  { id: 'todo', title: '待办', tone: 'slate' },
  { id: 'doing', title: '进行中', tone: 'amber' },
  { id: 'done', title: '已完成', tone: 'green' }
]

export const THEMES = [
  { id: 'light', label: '浅色' },
  { id: 'dark', label: '深色' },
  { id: 'sand', label: '暖沙' }
]

const BASE_CATEGORIES = ['产品', '开发', '测试', '运营']

export function uid() {
  return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
}

function seedTasks() {
  const now = Date.now()
  return [
    {
      id: uid(),
      title: '梳理赛题需求与验收标准',
      desc: '确认三列流转、分类筛选、localStorage 持久化三项核心能力。',
      category: '产品',
      status: 'done',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2
    },
    {
      id: uid(),
      title: '实现看板三列与卡片组件',
      desc: 'TaskCard 负责展示与拖拽，KanbanColumn 负责接收投放。',
      category: '开发',
      status: 'doing',
      createdAt: now - 86400000,
      updatedAt: now - 3600000
    },
    {
      id: uid(),
      title: '补充分类筛选与空态提示',
      desc: '按分类标签快速筛选；空列给出可拖拽的引导文案。',
      category: '开发',
      status: 'todo',
      createdAt: now - 3600000 * 5,
      updatedAt: now - 3600000 * 5
    },
    {
      id: uid(),
      title: '刷新页面验证数据不丢失',
      desc: '直接刷新与重新打开标签页两种场景各验证一次。',
      category: '测试',
      status: 'todo',
      createdAt: now - 3600000,
      updatedAt: now - 3600000
    }
  ]
}

export function useKanban() {
  const saved = loadState()

  const tasks = ref(Array.isArray(saved?.tasks) && saved.tasks.length ? saved.tasks : seedTasks())
  const theme = ref(THEMES.some((t) => t.id === saved?.theme) ? saved.theme : 'light')
  const activeCategory = ref('all')
  const keyword = ref('')

  const categories = computed(() => {
    const set = new Set(BASE_CATEGORIES)
    tasks.value.forEach((t) => t.category && set.add(t.category))
    return [...set]
  })

  const filteredTasks = computed(() => {
    const k = keyword.value.trim().toLowerCase()
    return tasks.value.filter((t) => {
      const byCategory = activeCategory.value === 'all' || t.category === activeCategory.value
      const byKeyword =
        !k || `${t.title} ${t.desc || ''}`.toLowerCase().includes(k)
      return byCategory && byKeyword
    })
  })

  const tasksIn = (columnId) => filteredTasks.value.filter((t) => t.status === columnId)
  const countIn = (columnId) => tasks.value.filter((t) => t.status === columnId).length

  const stats = computed(() => {
    const total = tasks.value.length
    const done = tasks.value.filter((t) => t.status === 'done').length
    return { total, done, rate: total ? Math.round((done / total) * 100) : 0 }
  })

  function addTask({ title, desc, category, status = 'todo' }) {
    const clean = (title || '').trim()
    if (!clean) return null
    const now = Date.now()
    const task = {
      id: uid(),
      title: clean.slice(0, 60),
      desc: (desc || '').trim().slice(0, 240),
      category: category || '产品',
      status,
      createdAt: now,
      updatedAt: now
    }
    tasks.value.unshift(task)
    return task
  }

  function updateTask(id, patch) {
    const t = tasks.value.find((x) => x.id === id)
    if (!t) return
    Object.assign(t, patch, { updatedAt: Date.now() })
  }

  function removeTask(id) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function moveTask(id, status) {
    const t = tasks.value.find((x) => x.id === id)
    if (!t || t.status === status) return
    t.status = status
    t.updatedAt = Date.now()
  }

  function moveStep(id, delta) {
    const t = tasks.value.find((x) => x.id === id)
    if (!t) return
    const idx = COLUMNS.findIndex((c) => c.id === t.status)
    const next = COLUMNS[idx + delta]
    if (next) moveTask(id, next.id)
  }

  function clearDone() {
    tasks.value = tasks.value.filter((t) => t.status !== 'done')
  }

  function resetAll() {
    tasks.value = seedTasks()
    activeCategory.value = 'all'
    keyword.value = ''
  }

  function setTheme(id) {
    if (THEMES.some((t) => t.id === id)) theme.value = id
  }

  watch(
    [tasks, theme],
    () => {
      saveState({ tasks: tasks.value, theme: theme.value })
      document.documentElement.dataset.theme = theme.value
    },
    { deep: true, immediate: true }
  )

  return {
    tasks,
    theme,
    activeCategory,
    keyword,
    categories,
    filteredTasks,
    stats,
    tasksIn,
    countIn,
    addTask,
    updateTask,
    removeTask,
    moveTask,
    moveStep,
    clearDone,
    resetAll,
    setTheme
  }
}
