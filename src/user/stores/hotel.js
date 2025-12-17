import { ref, computed } from "vue";
import { defineStore } from "pinia";

export default defineStore('hotel', () => {
    let hotels = ref([]);
    let today = ref(new Date().toISOString().split("T")[0]);
    let tomorrow = ref(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
    );
    let hotelDetail = ref({})
    let searchData = ref({
        checkInDate: today.value,
        checkOutDate: tomorrow.value,
        guestNumber: 2,
        size: 5,
        page: 0,
        sortBy: 'maxOccupancy',
        sortOrder: 'asc'
    });
    let filterData = ref({
        minPrice: 0,
        maxPrice: 20000,
        star: 0,
        hotelTypes: null,
        facilities: null
    })
    const night = computed(() => {
        const checkInDate = new Date(searchData.value.checkInDate);
        const checkOutDate = new Date(searchData.value.checkOutDate);
        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        const night = diffMs / (1000 * 60 * 60 * 24);
        return night;
    })

    function setHotels(data) {
        hotels.value = data;
    }
    function setSearchData(data) {
        searchData.value = data;
    }
    function setFilterData(data) {
        filterData.value = data;
    }
    function setHotelDetail(data) {
        hotelDetail.value = data;
    }
    return {
        setHotels, hotels,
        setSearchData, searchData,
        setFilterData, filterData,
        setHotelDetail, hotelDetail,
        night
    }
}, {
    persist: {
        storage: sessionStorage,
    }
})