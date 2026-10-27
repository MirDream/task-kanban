<script setup>
import { ref } from 'vue'
import KanbanColumn from './components/KanbanColumn.vue'
import TaskModal from './components/TaskModal.vue'
import { useKanban, COLUMNS, THEMES } from './composables/useKanban'

const kb = useKanban()

const modalOpen = ref(false)
const editing = ref(null)
const defaultStatus = ref('todo')

function openNew(status = 'todo') {
  editing.value = null
  defaultStatus.value = status
  modalOpen.value = true
}

function openEdit(task) {
  editing.value = task
  modalOpen.value = true
}

function onSubmit(payload) {
  if (payload.id) {
    kb.updateTask(payload.id, {
      title: payload.title,
      desc: payload.desc,
      category: payload.category,
      status: payload.status
    })
  } else {
    kb.addTask(payload)
  }
  modalOpen.value = false
}
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <div class="brand__mark">KB</div>
        <div class="brand__text">
          <h1>任务看板</h1>
          <p>拖拽流转 · 分类筛选 · 本地持久化</p>
        </div>
      </div>

      <div class="topbar__right">
        <div class="theme-switch" role="group" aria-label="主题切换">
          <button
            v-for="t in THEMES"
            :key="t.id"
            type="button"
            :class="{ 'is-active': kb.theme.value === t.id }"
            @click="kb.setTheme(t.id)"
          >
            {{ t.label }}
          </button>
        </div>
        <button class="btn btn--primary" type="button" @click="openNew('todo')">＋ 新建任务</button>
      </div>
    </header>

    <section class="summary">
      <div class="summary__item">
        <span class="summary__num">{{ kb.stats.value.total }}</span>
        <span class="summary__label">总任务</span>
      </div>
      <div class="summary__item">
        <span class="summary__num">{{ kb.stats.value.done }}</span>
        <span class="summary__label">已完成</span>
      </div>
      <div class="summary__item summary__item--wide">
        <div class="summary__row">
          <span class="summary__label">完成率</span>
          <span class="summary__pct">{{ kb.stats.value.rate }}%</span>
        </div>
        <div class="bar"><i :style="{ width: kb.stats.value.rate + '%' }"></i></div>
      </div>
      <div class="summary__actions">
        <input
          v-model="kb.keyword.value"
          class="search"
          type="search"
          placeholder="搜索标题或描述…"
        />
        <button class="btn btn--ghost" type="button" @click="kb.clearDone()">清空已完成</button>
        <button class="btn btn--ghost" type="button" @click="kb.resetAll()">重置示例</button>
      </div>
    </section>

    <nav class="filters" aria-label="分类筛选">
      <button
        type="button"
        class="filter"
        :class="{ 'is-active': kb.activeCategory.value === 'all' }"
        @click="kb.activeCategory.value = 'all'"
      >
        全部
        <span>{{ kb.stats.value.total }}</span>
      </button>
      <button
        v-for="c in kb.categories.value"
        :key="c"
        type="button"
        class="filter"
        :class="{ 'is-active': kb.activeCategory.value === c }"
        @click="kb.activeCategory.value = c"
      >
        {{ c }}
        <span>{{ kb.tasks.value.filter((t) => t.category === c).length }}</span>
      </button>
    </nav>

    <main class="board">
      <KanbanColumn
        v-for="col in COLUMNS"
        :key="col.id"
        :column="col"
        :tasks="kb.tasksIn(col.id)"
        :total="kb.countIn(col.id)"
        @drop-task="kb.moveTask"
        @add="openNew"
        @remove="kb.removeTask"
        @move-step="kb.moveStep"
        @edit="openEdit"
      />
    </main>

    <footer class="pagefoot">
      <span>双击卡片可编辑</span>
      <span class="dot">·</span>
      <span>数据保存在浏览器 localStorage，刷新不丢失</span>
    </footer>

    <TaskModal
      :open="modalOpen"
      :task="editing"
      :categories="kb.categories.value"
      :default-status="defaultStatus"
      @close="modalOpen = false"
      @submit="onSubmit"
    />
  </div>
</template>

<style scoped>
.app {
  max-width: 1180px;
  margin: 0 auto;
  padding: 26px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand__mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #22d3ee));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 32%, transparent);
}
.brand__text h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text);
}
.brand__text p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-switch {
  display: flex;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}
.theme-switch button {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 7px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.theme-switch button.is-active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
  font-weight: 600;
}

.summary {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 13px 18px;
}
.summary__item {
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.summary__item--wide {
  flex: 0 0 210px;
  min-width: 150px;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}
.summary__num {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.summary__label {
  font-size: 12px;
  color: var(--text-muted);
}
.summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.summary__pct {
  font-size: 12px;
  font-weight: 650;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.bar {
  height: 5px;
  background: var(--chip);
  border-radius: 999px;
  overflow: hidden;
}
.bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 50%, #22d3ee));
  transition: width 0.35s ease;
}
.summary__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-wrap: wrap;
}
.search {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 7px 11px;
  font-size: 12.5px;
  color: var(--text);
  width: 176px;
  outline: none;
  font-family: inherit;
}
.search:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.filter {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  border-radius: 999px;
  padding: 6px 13px;
  font-size: 12.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  transition: all 0.15s ease;
}
.filter span {
  font-size: 11px;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}
.filter:hover {
  border-color: var(--border-strong);
  color: var(--text);
}
.filter.is-active {
  background: color-mix(in srgb, var(--accent) 10%, var(--surface));
  border-color: color-mix(in srgb, var(--accent) 42%, transparent);
  color: var(--accent);
  font-weight: 600;
}
.filter.is-active span {
  color: var(--accent);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}

.pagefoot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: var(--text-faint);
  padding-top: 4px;
}
.dot {
  opacity: 0.6;
}

.btn {
  border-radius: 9px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.btn--primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 26%, transparent);
}
.btn--primary:hover {
  filter: brightness(1.06);
}
.btn--ghost {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
}
.btn--ghost:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

@media (max-width: 900px) {
  .board {
    grid-template-columns: 1fr;
  }
  .app {
    padding: 18px 14px 30px;
  }
}
</style>
