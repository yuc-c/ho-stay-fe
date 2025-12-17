import { ref } from "vue";
import { defineStore } from "pinia";
export default defineStore('booking', () => {
    let selectedRoomNumber = ref({});
    function setSelectedRoomNumber(data) {
        selectedRoomNumber.value = data;
    }
    return {
        setSelectedRoomNumber, selectedRoomNumber
    }
}, {
    persist: {
        storage: sessionStorage,
    }
})