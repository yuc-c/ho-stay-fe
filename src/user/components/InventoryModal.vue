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

              <!-- 飯店下拉 -->
              <tr v-if="action !== 'update'">
                <td>飯店 Hotel Name:</td>
                <td>
                  <CustomSelect
                    :options="hotels.map(h => ({
                      value: h.hotelId,
                      label: h.hotelName
                    }))"
                    v-model="selectedHotelId"
                    placeholder="請選擇飯店"
                    @update:modelValue="onHotelChange"
                  />
                </td>
              </tr>

              <!-- 房型下拉 -->
              <tr v-if="action !== 'update'">
                <td>房型 Room:</td>
                <td>
                  <CustomSelect
                    :options="rooms.map(r => ({
                      value: r.id,
                      label: r.name
                    }))"
                    v-model="selectedRoomId"
                    placeholder="請選擇房型"
                    @update:modelValue="onRoomChange"
                  />
                </td>
              </tr>

              <!-- 數量 -->
              <tr>
                <td>數量 Stock:</td>
                <td>
                  <input
                    type="number"
                    class="form-control"
                    :value="inventory.stock"
                    @input="doInput('stock', $event.target.value)"
                  />
                </td>
              </tr>

              <!-- 價格 -->
              <tr>
                <td>價格 Price:</td>
                <td>
                  <input
                    type="number"
                    class="form-control"
                    :value="inventory.price"
                    @input="doInput('price', $event.target.value)"
                  />
                </td>
              </tr>

              <!-- 單筆日期 -->
              <tr v-if="action === 'single'">
                <td>日期 Date:</td>
                <td>
                  <input
                    type="date"
                    class="form-control"
                    :value="inventory.date"
                    @input="doInput('date', $event.target.value)"
                  />
                </td>
              </tr>

              <!-- 區間日期 -->
              <tr v-if="action === 'range'">
                <td>開始日期 From:</td>
                <td>
                  <input
                    type="date"
                    class="form-control"
                    :value="inventory.firstDate"
                    @input="doInput('firstDate', $event.target.value)"
                  />
                </td>
              </tr>

              <tr v-if="action === 'range'">
                <td>結束日期 To:</td>
                <td>
                  <input
                    type="date"
                    class="form-control"
                    :value="inventory.lastDate"
                    @input="doInput('lastDate', $event.target.value)"
                  />
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="emits('close')">關閉</button>

          <button v-if="action === 'single'" type="button" class="btn btn-primary" @click="emits('insertSingle')">
            新增單筆
          </button>

          <button v-if="action === 'range'" type="button" class="btn btn-primary" @click="emits('insertRange')">
            新增區間
          </button>

          <button v-if="action === 'update'" type="button" class="btn btn-primary" @click="emits('callModify')">
            修改完成
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import CustomSelect from "@/user/components/CustomSelect.vue";

const props = defineProps({
  action: String,
  inventory: Object,
  hotels: Array
});

const emits = defineEmits([
  "callModify",
  "insertSingle",
  "insertRange",
  "update:inventory",
  "close"
]);

const selectedHotelId = ref("");
const selectedRoomId = ref("");
const rooms = ref([]);

const modalTitle = computed(() => {
  if (props.action === "single") return "新增單筆庫存";
  if (props.action === "range") return "新增區間庫存";
  if (props.action === "update") return "修改庫存";
  return "庫存管理";
});

/* 飯店變動 */
function onHotelChange() {
  const hotel = props.hotels.find(h => h.hotelId === selectedHotelId.value);

  rooms.value = hotel?.rooms || [];
  selectedRoomId.value = "";

  emits("update:inventory", {
    ...props.inventory,
    hotelId: hotel?.hotelId || null,
    hotelName: hotel?.hotelName || "",
    roomId: null,
    roomName: ""
  });
}

/* 房型變動 */
function onRoomChange() {
  const room = rooms.value.find(r => r.id === selectedRoomId.value);

  emits("update:inventory", {
    ...props.inventory,
    roomId: room?.id || null,
    roomName: room?.name || ""
  });
}

/* Input 更新 */
function doInput(key, value) {
  emits("update:inventory", {
    ...props.inventory,
    [key]: value
  });
}
</script>
