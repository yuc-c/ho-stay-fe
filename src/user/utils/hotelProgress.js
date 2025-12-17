/**
 * 飯店註冊進度追蹤工具
 * 檢查必填欄位並計算完成百分比
 */

/**
 * 計算飯店註冊進度
 * @param {Object} hotel - 飯店資料
 * @param {Array} roomTypes - 房型列表
 * @param {Array} images - 照片列表
 * @param {Object} settings - 付款設定等
 * @returns {Object} { percentage: number, completedSteps: Array, pendingSteps: Array }
 */
export function calculateHotelProgress(hotel, roomTypes = [], images = [], settings = {}) {
  // 確保所有步驟都正確初始化
  const steps = {
    basicInfo: {
      name: '基本資訊',
      weight: 25, // 權重 25%
      completed: false,
      requirements: []
    },
    rooms: {
      name: '客房',
      weight: 25, // 權重 25%
      completed: false,
      requirements: []
    },
    photos: {
      name: '相片',
      weight: 25, // 權重 25%
      completed: false,
      requirements: []
    },
    facilities: {
      name: '設施',
      weight: 25, // 權重 25%（總和為 100%）
      completed: false,
      requirements: []
    }
  }

  // 防護性檢查：確保 hotel 參數存在
  if (!hotel || typeof hotel !== 'object') {
    console.warn('calculateHotelProgress: hotel 參數無效', hotel)
    return {
      percentage: 0,
      completedSteps: [],
      pendingSteps: Object.values(steps).map((step, index) => ({ 
        key: Object.keys(steps)[index], 
        ...step 
      })),
      steps,
      canOpenBusiness: false
    }
  }

  // 步驟 1: 基本資訊檢查
  try {
    const basicChecks = [
      { field: 'name', label: '飯店名稱', value: hotel?.name },
      { field: 'license', label: '執照號碼', value: hotel?.license },
      { field: 'address', label: '地址', value: hotel?.address },
      { field: 'city', label: '城市', value: hotel?.district?.city?.name || hotel?.city },
      { field: 'district', label: '行政區', value: hotel?.district?.name || hotel?.district },
      { field: 'phone', label: '聯絡電話', value: hotel?.phone || hotel?.localCall },
    ]

    const completedBasic = basicChecks.filter(check => {
      const hasValue = check.value && check.value.toString().trim() !== ''
      if (!hasValue && steps.basicInfo) {
        steps.basicInfo.requirements.push(check.label)
      }
      return hasValue
    })

    // 基本資訊需要至少 5/6 必填欄位完成（執照、名稱、地址、城市、聯絡方式）
    const requiredBasic = ['飯店名稱', '執照號碼', '地址', '城市', '聯絡電話']
    const hasRequiredBasic = requiredBasic.every(req => 
      basicChecks.find(c => c.label === req && c.value && c.value.toString().trim() !== '')
    )

    if (steps.basicInfo) {
      steps.basicInfo.completed = hasRequiredBasic && completedBasic.length >= 5
    }
  } catch (error) {
    console.error('計算基本資訊進度時出錯：', error)
    if (steps.basicInfo) {
      steps.basicInfo.completed = false
    }
  }

  // 步驟 2: 客房檢查
  try {
    if (Array.isArray(roomTypes) && roomTypes.length > 0) {
      if (steps.rooms) {
        steps.rooms.completed = true
      }
    } else {
      if (steps.rooms) {
        steps.rooms.requirements.push('至少需要一個房型')
      }
    }
  } catch (error) {
    console.error('計算客房進度時出錯：', error)
    if (steps.rooms) {
      steps.rooms.completed = false
    }
  }

  // 步驟 3: 相片檢查
  try {
    if (Array.isArray(images) && images.length > 0) {
      // 建議至少 3 張照片，但至少要有 1 張
      if (steps.photos) {
        if (images.length >= 3) {
          steps.photos.completed = true
        } else {
          steps.photos.completed = true // 至少 1 張就算完成
          if (images.length < 3) {
            steps.photos.requirements.push('建議至少上傳 3 張照片（目前 ' + images.length + ' 張）')
          }
        }
      }
    } else {
      if (steps.photos) {
        steps.photos.requirements.push('至少需要上傳 1 張照片')
      }
    }
  } catch (error) {
    console.error('計算相片進度時出錯：', error)
    if (steps.photos) {
      steps.photos.completed = false
    }
  }

  // 步驟 4: 設施檢查
  try {
    const facilityIds = hotel?.facilityIds || hotel?.facilities || []
    if (Array.isArray(facilityIds) && facilityIds.length > 0) {
      if (steps.facilities) {
        steps.facilities.completed = true
        // 建議至少設定 3 個設施
        if (facilityIds.length < 3) {
          steps.facilities.requirements.push('建議至少設定 3 個設施（目前 ' + facilityIds.length + ' 個）')
        }
      }
    } else {
      if (steps.facilities) {
        steps.facilities.requirements.push('至少需要設定 1 個設施')
      }
    }
  } catch (error) {
    console.error('計算設施進度時出錯：', error)
    if (steps.facilities) {
      steps.facilities.completed = false
    }
  }

  // 注意：付款設定已移除，預設所有飯店都使用平台線上付款方式

  // 計算完成百分比
  let totalWeight = 0
  let completedWeight = 0

  Object.values(steps).forEach(step => {
    // 確保 step 存在且有效
    if (step && typeof step === 'object' && 'weight' in step) {
      totalWeight += step.weight || 0
      if (step.completed) {
        completedWeight += step.weight || 0
      }
    }
  })

  // 避免除以零
  const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0

  // 整理完成的步驟和待完成的步驟
  const completedSteps = Object.entries(steps)
    .filter(([_, step]) => step.completed)
    .map(([key, step]) => ({ key, ...step }))

  const pendingSteps = Object.entries(steps)
    .filter(([_, step]) => !step.completed)
    .map(([key, step]) => ({ key, ...step }))

  return {
    percentage,
    completedSteps,
    pendingSteps,
    steps,
    canOpenBusiness: percentage === 100
  }
}

/**
 * 獲取進度狀態的顏色
 */
export function getProgressColor(percentage) {
  if (percentage === 100) return 'bg-green-500'
  if (percentage >= 75) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * 獲取進度狀態的文字
 */
export function getProgressText(percentage) {
  if (percentage === 100) return '已完成'
  if (percentage >= 75) return '即將完成'
  if (percentage >= 50) return '進行中'
  return '待開始'
}

