import { createRouter, createWebHistory } from 'vue-router'
import Hotels from '@/user/views/Hotels.vue'
import NotFound from '@/user/views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Hotels',
    component: Hotels,
  },
  {
    path: '/hotels/new',
    name: 'HotelForm',
    component: () => import('@/user/views/HotelForm.vue'),
  },
  {
    path: '/hotels/setup',
    name: 'HotelSetup',
    component: () => import('@/user/views/HotelSetup.vue'),
  },
  {
    path: '/hotels/:hotelId/setup',
    name: 'HotelSetupEdit',
    component: () => import('@/user/views/HotelSetup.vue'),
  },
  {
    path: '/hotels/:id',
    name: 'HotelEdit',
    component: () => import('@/user/views/HotelForm.vue'),
  },
  {
    path: '/hotels/:id/images',
    name: 'HotelImages',
    component: () => import('@/user/views/HotelImages.vue'),
  },
  {
    path: '/hotels/:hotelId/room-types',
    name: 'RoomTypes',
    component: () => import('@/user/views/RoomTypes.vue'),
  },
  {
    path: '/hotels/:hotelId/room-types/new',
    name: 'RoomTypeForm',
    component: () => import('@/user/views/RoomTypeForm.vue'),
  },
  {
    path: '/hotels/:hotelId/room-types/:roomTypeId',
    name: 'RoomTypeEdit',
    component: () => import('@/user/views/RoomTypeForm.vue'),
  },
  {
    path: '/hotels/:hotelId/facilities',
    name: 'Facilities',
    component: () => import('@/user/views/Facilities.vue'),
  },
  // 測試頁面（已停用，地圖功能已正常運作）
  // {
  //   path: '/test-map',
  //   name: 'TestMap',
  //   component: () => import('@/user/views/TestMap.vue'),
  //   // 不需要認證，直接用於測試 Maps JavaScript API
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory('/owner.html'),
  routes,
})

export default router

