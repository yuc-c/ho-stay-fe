// src/utils/googleMaps.js
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// 獲取 API Key
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("❌ VITE_GOOGLE_MAPS_API_KEY 未設定");
    console.error("請確認：");
    console.error("1. .env 檔案中有設定 VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY");
    console.error("2. 開發伺服器已重啟（修改 .env 後必須重啟 npm run dev）");
  }
  return apiKey;
};

// 載入狀態追蹤
let mapsLibraryLoaded = false;
let placesLibraryLoaded = false;
let geometryLibraryLoaded = false;
let optionsInitialized = false;

/**
 * 初始化 Google Maps API 選項
 * 根據 @googlemaps/js-api-loader v2.0+ 文檔，setOptions 應該在模組層級調用一次
 * 且必須在第一次 importLibrary 之前調用
 */
function initializeOptions() {
  if (optionsInitialized) {
    return; // 已經初始化過，不需要重複設定
  }

  const apiKey = getApiKey();
  
  if (!apiKey || apiKey.trim() === '') {
    const errorMsg = '❌ VITE_GOOGLE_MAPS_API_KEY 未設定或為空，請檢查 .env 檔案';
    console.error(errorMsg);
    throw new Error('Google Maps API Key 未設定，請檢查環境變數 VITE_GOOGLE_MAPS_API_KEY');
  }
  
  const trimmedKey = apiKey.trim();
  
  // 驗證 API Key 格式
  if (!trimmedKey.startsWith('AIza')) {
    console.warn('⚠️ API Key 格式可能不正確（應該以 AIza 開頭），當前:', trimmedKey.substring(0, 10));
  }
  
  try {
    // 在模組層級設定選項（只調用一次）
    // 注意：APIOptions 使用 'key' 而不是 'apiKey'
    setOptions({
      key: trimmedKey, // 使用 'key' 而不是 'apiKey'
      v: 'weekly', // 版本參數使用 'v'
      language: 'zh-TW',
      region: 'TW'
    });
    
    optionsInitialized = true;
    console.log('✅ Google Maps API 選項已初始化（模組層級）');
    console.log('🔑 API Key:', trimmedKey.substring(0, 10) + '...' + trimmedKey.substring(trimmedKey.length - 4));
  } catch (error) {
    console.error('❌ 設定 Google Maps API 選項失敗:', error);
    throw error;
  }
}

// 在模組載入時立即初始化選項（如果 API Key 可用）
// 這確保 setOptions 在第一次 importLibrary 之前就被調用
// 注意：如果 API Key 未設定，不會拋出錯誤，會在 loadGoogleMaps() 時再處理
const apiKeyAtModuleLoad = getApiKey();
if (apiKeyAtModuleLoad && apiKeyAtModuleLoad.trim() !== '') {
  try {
    initializeOptions();
  } catch (error) {
    // 如果初始化失敗，記錄錯誤但不阻止模組載入
    // 這樣可以在運行時提供更友好的錯誤訊息
    console.warn('⚠️ Google Maps API 選項初始化失敗，將在 loadGoogleMaps() 時重試:', error.message || error);
  }
} else {
  console.warn('⚠️ Google Maps API Key 在模組載入時未設定，將在 loadGoogleMaps() 時初始化');
}

/**
 * 載入 Google Maps API
 * @returns {Promise<Object>} Google Maps API 物件
 */
export async function loadGoogleMaps() {
  try {
    // 確保選項已初始化（如果模組載入時失敗或未設定，這裡會重試）
    if (!optionsInitialized) {
      console.log('🔧 初始化 Google Maps API 選項...');
      initializeOptions();
    }

    const apiKey = getApiKey();
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Google Maps API Key 未設定，請檢查環境變數 VITE_GOOGLE_MAPS_API_KEY');
    }

    // 再次確保 setOptions 已調用（在每次 importLibrary 之前都應該確認）
    // 這對於某些邊緣情況可能是必要的
    if (!optionsInitialized) {
      console.warn('⚠️ 選項未初始化，重新初始化...');
      initializeOptions();
    }

    // 按需載入所需的庫
    // 重要：確保 setOptions 已在第一次 importLibrary 之前調用
    if (!mapsLibraryLoaded) {
      console.log('📦 載入 Google Maps library...');
      
      // 最後確認選項已初始化
      if (!optionsInitialized) {
        console.error('❌ 選項未初始化，無法載入 Maps library');
        throw new Error('Google Maps API 選項未初始化，請檢查環境變數 VITE_GOOGLE_MAPS_API_KEY');
      }
      
      await importLibrary('maps');
      mapsLibraryLoaded = true;
      console.log('✅ Google Maps library 已載入');
    }
    
    if (!placesLibraryLoaded) {
      console.log('📦 載入 Places library...');
      await importLibrary('places');
      placesLibraryLoaded = true;
      console.log('✅ Places library 已載入');
    }
    
    if (!geometryLibraryLoaded) {
      console.log('📦 載入 Geometry library...');
      await importLibrary('geometry');
      geometryLibraryLoaded = true;
      console.log('✅ Geometry library 已載入');
    }

    // 驗證 API Key 是否正確傳遞到 Google Maps 腳本
    // 注意：只檢查主要的 Maps JavaScript API 腳本，動態載入的庫（如 geocoder.js, places.js）
    // 不會在 URL 中包含 API Key，因為 API Key 已經在 setOptions 中設定
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    if (scripts.length > 0) {
      // 查找包含 API Key 的主要腳本（通常是 map.js 或 main.js，不是動態載入的庫）
      let mainScript = null;
      for (const script of Array.from(scripts)) {
        const scriptSrc = script.src;
        // 主要腳本通常包含 'map.js' 或 'main.js'，且包含 API Key
        if ((scriptSrc.includes('map.js') || scriptSrc.includes('main.js') || scriptSrc.includes('/api/js/')) &&
            (scriptSrc.includes('key=') || scriptSrc.includes('api_key='))) {
          mainScript = script;
          break;
        }
      }
      
      // 如果找不到主要腳本，檢查是否有任何腳本包含 API Key
      if (!mainScript) {
        for (const script of Array.from(scripts)) {
          const scriptSrc = script.src;
          if (scriptSrc.includes('key=') || scriptSrc.includes('api_key=')) {
            mainScript = script;
            break;
          }
        }
      }
      
      if (mainScript) {
        const scriptSrc = mainScript.src;
        const keyMatch = scriptSrc.match(/(?:api_key|key)=([^&]+)/);
        if (keyMatch) {
          const keyInUrl = decodeURIComponent(keyMatch[1]);
          console.log('🔍 驗證 API Key 是否正確傳遞到 Google...');
          console.log('   URL 中的 Key:', keyInUrl.substring(0, 10) + '...' + keyInUrl.substring(keyInUrl.length - 4));
          
          if (keyInUrl !== apiKey.trim()) {
            console.warn('⚠️ URL 中的 API Key 與環境變數不一致！');
            console.warn('   這可能導致驗證失敗');
          } else {
            console.log('✅ API Key 已正確傳遞到 Google Maps 腳本');
          }
        }
      } else {
        // 如果找不到包含 API Key 的腳本，這可能是正常的（動態載入的庫）
        // 因為 API Key 已經在 setOptions 中設定，會自動應用到所有庫
        console.log('ℹ️ 未找到包含 API Key 的主要腳本 URL（這可能是正常的）');
        console.log('   動態載入的庫（如 geocoder.js, places.js）不會在 URL 中包含 API Key');
        console.log('   因為 API Key 已經在 setOptions 中設定，會自動應用到所有庫');
        console.log(`   已載入 ${scripts.length} 個 Google Maps 相關腳本`);
      }
    }

    // 返回 window.google（載入後會自動掛載）
    if (!window.google) {
      throw new Error('Google Maps API 載入失敗，window.google 不存在');
    }

    console.log('✅ Google Maps API 載入完成');
    return window.google;

  } catch (error) {
    console.error('❌ 載入 Google Maps 失敗:', error);
    console.error('錯誤詳情:', error.message || error);
    
    const apiKey = getApiKey();
    if (apiKey) {
      console.error('當前 API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
    } else {
      console.error('當前 API Key: 未設定');
    }
    
    console.error('\n🔧 請確認以下事項：');
    console.error('1. .env 檔案中有設定 VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY');
    console.error('2. 開發伺服器已重啟（修改 .env 後必須重啟 npm run dev）');
    console.error('3. API Key 已在 Google Cloud Console 啟用以下 API：');
    console.error('   - Maps JavaScript API');
    console.error('   - Places API');
    console.error('   - Geocoding API（用於反向地理編碼）');
    console.error('4. API Key 已關聯計費帳戶（即使使用免費額度也需要）');
    console.error('5. API Key 沒有過期或失效');
    console.error('6. API Key 的使用限制允許您的網域（或暫時取消限制進行測試）');
    console.error('7. 清除瀏覽器快取並重新載入頁面');
    
    // 提供更詳細的錯誤訊息
    let errorMessage = '載入 Google Maps 失敗';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.toString && error.toString().includes('ApiProjectMapError')) {
      errorMessage = 'Google Maps API Key 驗證失敗。請確認 API Key 已啟用 Maps JavaScript API 和 Places API，並且已關聯計費帳戶。';
    } else if (error.toString && error.toString().includes('NoApiKeys')) {
      errorMessage = 'Google Maps API Key 未正確傳遞。請確認 setOptions 已在模組層級正確調用，且 API Key 已設定。';
    }
    
    throw new Error(errorMessage);
  }
}
