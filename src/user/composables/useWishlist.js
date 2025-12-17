import { ref } from "vue";
import myAxios from "@/user/plugin/axios";
import useUserStore from '@/user/stores/user.js'

export default function useWishlist() {
    const favoriteId = ref([]);
    const favorites = ref([]);
    const page = ref(0);
    const totalElements = ref(0);
    //切換收藏狀態
    function handleFavorite(hotelId, isFavorite) {
        if (!isFavorite) {
            addToFavorite(hotelId);
        } else {
            removeFromFavorite(hotelId);
        }
    }

    //加入收藏
    function addToFavorite(hotelId) {
        myAxios({
            method: 'post',
            url: `/api/wishlist/${hotelId}`,
            requiresAuth: true
        })
            .then(response => {
                console.log(response)
                favoriteId.value.push(hotelId);
            })
            .catch(error => console.log(error));
    }
    //移除收藏
    function removeFromFavorite(hotelId) {
        myAxios({
            method: 'delete',
            url: `/api/wishlist/${hotelId}`,
            requiresAuth: true
        })
            .then(response => {
                console.log(response)
                const index = favoriteId.value.indexOf(hotelId);
                if (index != -1) {
                    favoriteId.value.splice(index, 1);
                    console.log("favoriteId" + favoriteId.value);
                }
                for (let i = 0; i < favorites.value.length; i++) {
                    if (favorites.value[i].id == hotelId) {
                        favorites.value.splice(i, 1);
                        break;
                    }
                }

            })
            .catch(error => console.log(error));
    }
    //初始化使用者收藏
    function initializeFavorite() {
        const userStore = useUserStore();
        if (userStore.token.length != 0) {
            myAxios({
                method: 'get',
                url: "/api/wishlist",
                requiresAuth: true
            })
                .then(response => {
                    console.log(response);
                    for (let hotel of response.data) {
                        favoriteId.value.push(hotel.id);
                    }
                    console.log("useWishlist favoriteId=" + favoriteId.value);
                })
                .catch(error => console.log(error));
        }
    }

    function isFavorite(hotelId) {
        return favoriteId.value.includes(hotelId);
    }

    function favoriteList(pageNumber = 0, size = 4) {

        return myAxios({
            method: 'get',
            url: "/api/wishlist/user",
            requiresAuth: true,
            params: {
                page: pageNumber,
                size: size
            }
        })
            .then(response => {
                console.log(response);
                favorites.value = response.data.content;
                page.value = response.data.totalPages;
                totalElements.value = response.data.totalElements;
            })
            .catch(error => {
                console.log(error);
            })
    }



    function removeFavoriteAndRefresh(hotelId, currentPage, size) {
        myAxios({
            method: 'delete',
            url: `/api/wishlist/${hotelId}`,
            requiresAuth: true
        })
            .then(() => {
                // 先抓當前頁資料
                return favoriteList(currentPage, size);
            }).then(() => {
                if (favorites.value.length === 0 && currentPage > 0) {
                    currentPage--;
                    return favoriteList(currentPage, size);
                }
            })
            .catch(err => console.error(err));
    }


    return {
        favoriteId,
        initializeFavorite,
        addToFavorite,
        removeFromFavorite,
        handleFavorite,
        isFavorite,
        favoriteList,
        removeFavoriteAndRefresh,
        favorites,
        page,
        totalElements
    };
}