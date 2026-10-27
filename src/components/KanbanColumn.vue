<script setup>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  column: { type: Object, required: true },
  tasks: { type: Array, default: () => [] },
  total: { type: Number, default: 0 }
})

const emit = defineEmits(['drop-task', 'add', 'remove', 'move-step', 'drag-start', 'drag-end', 'edit'])

const isOver = ref(false)
let depth = 0

function onDragEnter() {
  depth += 1
  isOver.value = true
}

function onDragLeave() {
  depth -= 1
  if (depth <= 0) {
    depth = 0
    isOver.value = false
  }
}

function onDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function onDrop(e) {
  e.preventDefault()
  depth = 0
  isOver.value = false
  const id = e.dataTransfer.getData('text/plain')
  if (id) emit('drop-task', id, props.column.id)
}
</script>

<template>
  <section
    class="col"
    :class="[`col--${column.tone}`, { 'is-over': isOver }]"
    :data-column="column.id"
    @dragenter.prevent="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <header class="col__head">
      <div class="col__title">
        <span class="col__dot"></span>
        <h2>{{ column.title }}</h2>
        <span class="col__count">{{ total }}</span>
      </div>
      <button class="col__add" type="button" title="在该列新建任务" @click="emit('add', column.id)">＋</button>
    </header>

    <div class="col__body">
      <TransitionGroup name="card" tag="div" class="col__list">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @remove="(id) => emit('remove', id)"
          @move-step="(id, d) => emit('move-step', id, d)"
          @drag-start="(id) => emit('drag-start', id)"
          @drag-end="emit('drag-end')"
          @edit="(task) => emit('edit', task)"
        />
      </TransitionGroup>

      <p v-if="!tasks.length" class="col__empty">
        {{ total ? '当前筛选下暂无匹配任务' : '拖拽卡片到此列，或点右上角 ＋ 新建' }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.col {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.col.is-over {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 7%, var(--surface-2));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}

.col__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 10px;
}

.col__title {
  display: flex;
  align-items: center;
  gap: 7px;
}
.col__title h2 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 650;
  color: var(--text);
  letter-spacing: 0.01em;
}
.col__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--col-tone, #94a3b8);
}
.col--slate { --col-tone: #64748b; }
.col--amber { --col-tone: #f59e0b; }
.col--green { --col-tone: #10b981; }

.col__count {
  font-size: 11.5px;
  color: var(--text-muted);
  background: var(--chip);
  border-radius: 999px;
  padding: 2px 7px;
  font-variant-numeric: tabular-nums;
}

.col__add {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  width: 24px;
  height: 24px;
  border-radius: 7px;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
}
.col__add:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
}

.col__body {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-height: 120px;
  overflow-y: auto;
  padding-right: 2px;
}

.col__list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.col__empty {
  margin: 14px 2px;
  padding: 18px 10px;
  text-align: center;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-faint);
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
}

.card-enter-active,
.card-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
.card-leave-active {
  position: absolute;
  width: 100%;
}
.card-move {
  transition: transform 0.22s ease;
}
</style>
