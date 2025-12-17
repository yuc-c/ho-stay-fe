// 使用統一的 API 請求函數（帶 Token 認證）
import { apiRequest } from './request'

// 飯店類型映射
export const hotelTypeMap = {
  'hotel': 1,
  'bnb': 2,
  'hostel': 3,
  'resort': 4,
  'apartment': 5,
}

// 反向映射（從 ID 到名稱）
export const hotelTypeReverseMap = {
  1: 'hotel',
  2: 'bnb',
  3: 'hostel',
  4: 'resort',
  5: 'apartment',
}

// 城市和行政區到 districtId 的映射表
// 注意：這是一個簡化的映射表，實際應該從後端 API 獲取
// 由於行政區名稱在資料庫中是唯一的，我們可以根據名稱查找
const districtNameToIdMap = new Map()

/**
 * 根據行政區名稱獲取 districtId
 * 優先從後端 API 獲取，如果失敗則使用緩存的映射表
 */
export async function getDistrictIdByName(districtName, cityName) {
  if (!districtName) return null

  // 使用城市+行政區作為 key，避免同名行政區衝突（例如「大安區」在台北市和台中市都有）
  const mapKey = cityName ? `${cityName}-${districtName}` : districtName

  // 如果映射表中已有，直接返回
  if (districtNameToIdMap.has(mapKey)) {
    return districtNameToIdMap.get(mapKey)
  }

  try {
    // 方法1：嘗試從後端獲取所有 districts 並建立映射表
    const districts = await apiRequest('/districts')
    
    if (districts && Array.isArray(districts)) {
      // 建立映射表（考慮城市名稱，避免同名行政區衝突）
      districts.forEach(district => {
        if (district.name) {
          // 如果有城市資訊，使用城市+行政區作為 key
          if (district.city && district.city.name) {
            const key = `${district.city.name}-${district.name}`
            districtNameToIdMap.set(key, district.id)
            // 同時也設置僅使用行政區名稱的映射（用於沒有城市名稱的情況）
            if (!districtNameToIdMap.has(district.name)) {
              districtNameToIdMap.set(district.name, district.id)
            }
          } else {
            districtNameToIdMap.set(district.name, district.id)
          }
        }
      })
      
      // 優先使用城市+行政區作為 key 查找
      const districtId = districtNameToIdMap.get(mapKey) || districtNameToIdMap.get(districtName)
      if (districtId) {
        return districtId
      }
    }
  } catch (error) {
    console.warn('無法從後端獲取所有 districts，嘗試按名稱查詢', error)
    
    // 方法2：嘗試直接按名稱和城市查詢（更準確）
    try {
      let url = `/districts/by-name?name=${encodeURIComponent(districtName)}`
      if (cityName) {
        url += `&cityName=${encodeURIComponent(cityName)}`
      }
      const district = await apiRequest(url)
      if (district && district.id) {
        // 使用城市+行政區作為 key，避免同名行政區衝突
        const key = cityName ? `${cityName}-${districtName}` : districtName
        districtNameToIdMap.set(key, district.id)
        return district.id
      }
    } catch (err) {
      console.warn('無法從後端按名稱查詢 district', err)
    }
  }

  // 如果後端 API 都失敗，使用硬編碼的映射表（僅作為最後的備用方案）
  const hardcodedMap = {
    // 台北市
    '中正區': 1,
    '大同區': 2,
    '中山區': 3,
    '松山區': 4,
    '大安區': 5,
    '萬華區': 6,
    '信義區': 7,
    '士林區': 8,
    '北投區': 9,
    '內湖區': 10,
    '南港區': 11,
    '文山區': 12,
    // 注意：這只是示例，實際應該從資料庫獲取完整列表
  }

  const districtId = hardcodedMap[districtName]
  if (districtId) {
    districtNameToIdMap.set(districtName, districtId)
    return districtId
  }

  // 如果找不到，返回 null
  console.warn(`找不到行政區 "${districtName}" 的 ID`)
  return null
}

/**
 * 獲取所有 districts（如果後端有 API）
 */
export async function getAllDistricts() {
  try {
    return await apiRequest('/districts')
  } catch (error) {
    console.warn('後端沒有 /api/districts 端點', error)
    return []
  }
}

/**
 * 根據城市名稱獲取該城市的所有行政區
 * @param {string} cityName - 城市名稱
 * @returns {Promise<Array>} 行政區列表
 */
export async function getDistrictsByCityName(cityName) {
  if (!cityName) {
    return []
  }

  try {
    const url = `/districts/by-city-name?cityName=${encodeURIComponent(cityName)}`
    const districts = await apiRequest(url)
    return Array.isArray(districts) ? districts : []
  } catch (error) {
    console.warn(`無法從後端獲取城市 "${cityName}" 的行政區列表`, error)
    return []
  }
}