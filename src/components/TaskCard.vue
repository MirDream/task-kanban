<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true }
})

const emit = defineEmits(['remove', 'move-step', 'drag-start', 'drag-end', 'edit'])

const palette = {
  产品: '#6366f1',
  开发: '#0ea5e9',
  测试: '#f59e0b',
  运营: '#10b981'
}

const tagColor = computed(() => palette[props.task.category] || '#8b5cf6')

const createdText = computed(() => {
  const d = new Date(props.task.createdAt || Date.now())
  return `${d.getMonth() + 1}/${d.getDate()}`
})

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.task.id)
  e.currentTarget.classList.add('is-dragging')
  emit('drag-start', props.task.id)
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('is-dragging')
  emit('drag-end')
}
</script>

<template>
  <article
    class="card"
    draggable="true"
    :data-task-id="task.id"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dblclick="emit('edit', task)"
  >
    <header class="card__head">
      <span class="card__tag" :style="{ '--tag': tagColor }">{{ task.category }}</span>
      <button class="card__del" type="button" title="删除任务" @click="emit('remove', task.id)">×</button>
    </header>

    <h3 class="card__title">{{ task.title }}</h3>
    <p v-if="task.desc" class="card__desc">{{ task.desc }}</p>

    <footer class="card__foot">
      <time class="card__date">{{ createdText }}</time>
      <div class="card__ops">
        <button type="button" title="左移一列" @click="emit('move-step', task.id, -1)">←</button>
        <button type="button" title="右移一列" @click="emit('move-step', task.id, 1)">→</button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 13px 10px;
  cursor: grab;
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
.card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.09);
  transform: translateY(-1px);
}
.card:active {
  cursor: grabbing;
}
.card.is-dragging {
  opacity: 0.45;
  transform: scale(0.98);
}

.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}

.card__tag {
  font-size: 11px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--tag);
  background: color-mix(in srgb, var(--tag) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--tag) 26%, transparent);
  font-weight: 600;
}

.card__del {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 17px;
  line-height: 1;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
}
.card:hover .card__del {
  opacity: 1;
}
.card__del:hover {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #ef4444;
}

.card__title {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--text);
  word-break: break-word;
}

.card__desc {
  margin: 0 0 10px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.card__date {
  font-size: 11.5px;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.card__ops {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.card:hover .card__ops {
  opacity: 1;
}

.card__ops button {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-muted);
  width: 22px;
  height: 20px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
}
.card__ops button:hover {
  color: var(--text);
  border-color: var(--border-strong);
}
</style>
