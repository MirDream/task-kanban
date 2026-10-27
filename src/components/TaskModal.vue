<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { COLUMNS } from '../composables/useKanban'

const props = defineProps({
  open: { type: Boolean, default: false },
  task: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  defaultStatus: { type: String, default: 'todo' }
})

const emit = defineEmits(['close', 'submit'])

const title = ref('')
const desc = ref('')
const category = ref('产品')
const status = ref('todo')
const customCategory = ref('')
const titleInput = ref(null)
const useCustom = ref(false)

const isEdit = computed(() => Boolean(props.task))
const canSubmit = computed(() => title.value.trim().length > 0)

watch(
  () => props.open,
  async (v) => {
    if (!v) return
    if (props.task) {
      title.value = props.task.title
      desc.value = props.task.desc || ''
      category.value = props.task.category || '产品'
      status.value = props.task.status
      useCustom.value = !props.categories.includes(props.task.category)
      customCategory.value = useCustom.value ? props.task.category : ''
    } else {
      title.value = ''
      desc.value = ''
      category.value = '产品'
      status.value = props.defaultStatus
      useCustom.value = false
      customCategory.value = ''
    }
    await nextTick()
    titleInput.value?.focus()
  }
)

function submit() {
  if (!canSubmit.value) return
  const cat = useCustom.value ? customCategory.value.trim() || '其他' : category.value
  emit('submit', {
    id: props.task?.id,
    title: title.value.trim(),
    desc: desc.value.trim(),
    category: cat,
    status: status.value
  })
}
</script>

<template>
  <div v-if="open" class="mask" @click.self="emit('close')" @keydown.esc="emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <header class="modal__head">
        <h2>{{ isEdit ? '编辑任务' : '新建任务' }}</h2>
        <button class="modal__close" type="button" @click="emit('close')">×</button>
      </header>

      <div class="modal__body">
        <label class="field">
          <span class="field__label">标题<em>*</em></span>
          <input
            ref="titleInput"
            v-model="title"
            class="field__input"
            type="text"
            maxlength="60"
            placeholder="例如：补充分类筛选与空态提示"
            @keyup.enter="submit"
          />
        </label>

        <label class="field">
          <span class="field__label">描述</span>
          <textarea
            v-model="desc"
            class="field__input field__input--area"
            rows="3"
            maxlength="240"
            placeholder="补充背景、验收要点或备注（选填）"
          ></textarea>
        </label>

        <div class="field-row">
          <div class="field">
            <span class="field__label">分类</span>
            <div class="chips">
              <button
                v-for="c in categories"
                :key="c"
                type="button"
                class="chip"
                :class="{ 'is-active': !useCustom && category === c }"
                @click="useCustom = false; category = c"
              >
                {{ c }}
              </button>
              <button
                type="button"
                class="chip"
                :class="{ 'is-active': useCustom }"
                @click="useCustom = true"
              >
                自定义
              </button>
            </div>
            <input
              v-if="useCustom"
              v-model="customCategory"
              class="field__input field__input--sm"
              type="text"
              maxlength="8"
              placeholder="输入分类名"
            />
          </div>
        </div>

        <div class="field">
          <span class="field__label">状态</span>
          <div class="chips">
            <button
              v-for="c in COLUMNS"
              :key="c.id"
              type="button"
              class="chip"
              :class="{ 'is-active': status === c.id }"
              @click="status = c.id"
            >
              {{ c.title }}
            </button>
          </div>
        </div>
      </div>

      <footer class="modal__foot">
        <button class="btn btn--ghost" type="button" @click="emit('close')">取消</button>
        <button class="btn btn--primary" type="button" :disabled="!canSubmit" @click="submit">
          {{ isEdit ? '保存' : '创建' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 50;
  animation: fade 0.16s ease;
}
@keyframes fade {
  from { opacity: 0; }
}

.modal {
  width: min(520px, 100%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  overflow: hidden;
  animation: pop 0.18s ease;
}
@keyframes pop {
  from { transform: translateY(8px) scale(0.985); opacity: 0; }
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border);
}
.modal__head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  color: var(--text);
}
.modal__close {
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  width: 26px;
  height: 26px;
  border-radius: 7px;
}
.modal__close:hover {
  background: var(--chip);
}

.modal__body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}
.field__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}
.field__label em {
  color: #ef4444;
  font-style: normal;
  margin-left: 2px;
}

.field__input {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 9px 11px;
  font-size: 13.5px;
  color: var(--text);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.field__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}
.field__input--area {
  resize: vertical;
  line-height: 1.6;
}
.field__input--sm {
  margin-top: 6px;
  padding: 7px 10px;
  font-size: 12.5px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.chip {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-muted);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.chip:hover {
  border-color: var(--border-strong);
  color: var(--text);
}
.chip.is-active {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  color: var(--accent);
  font-weight: 600;
}

.modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 13px 18px;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
}

.btn {
  border-radius: 9px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
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
.btn--primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: #fff;
}
.btn--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}
.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
