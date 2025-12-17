<template>
  <div class="modal-backdrop" @click.self="emits('close')">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">{{ modalTitle }}</h1>
          <button type="button" class="btn-close" @click="emits('close')"></button>
        </div>

        <div class="modal-body">
          <table class="table">
            <tbody>
              <tr>
                <td>{{ props.action === 'insert' ? 'Your reply：' : 'Update your reply：' }}</td>
                <td>
                  <input type="text" class="form-control" v-model="replyText" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <button v-if="props.action === 'insert'" type="button" class="btn btn-primary" @click="handleInsert">
            新增回覆
          </button>

          <button v-else type="button" class="btn btn-primary" @click="handleModify">
            修改回覆
          </button>

          <button type="button" class="btn btn-secondary" @click="emits('close')">
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({ action: String, review: Object });

// ❗ delete 已經不用了，因此只有 insert / modify / close
const emits = defineEmits(['insert','modify','close']);

const replyText = ref('');

// 初始化內容
watch(
  () => props.review,
  (newVal) => {
    replyText.value = newVal?.reply || '';
  },
  { immediate: true }
);

const modalTitle = computed(() =>
  props.action === 'insert' ? '新增回覆' : '修改回覆'
);

function handleInsert() {
  emits('insert', { ...props.review, reply: replyText.value });
}

function handleModify() {
  emits('modify', { ...props.review, reply: replyText.value });
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.modal-dialog { max-width: 600px; width: 90%; }
.modal-content { background: white; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #dee2e6; }
.modal-body { padding: 1rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem; border-top: 1px solid #dee2e6; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; cursor: pointer; opacity: 0.5; }
.btn-close:hover { opacity: 1; }

/* 綠色主按鈕 */
.modal-footer .btn-primary {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}
.modal-footer .btn-primary:hover {
  background-color: #218838;
  border-color: #218838;
}
</style>
