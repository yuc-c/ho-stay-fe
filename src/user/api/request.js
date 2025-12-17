// API 基礎配置
// 開發模式使用相對路徑（會經過 Vite proxy），生產模式使用完整 URL
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||

    (import.meta.env.DEV ? '/api' : 'http://192.168.25.152:8080/api')




// 確保 API_BASE_URL 以 /api 結尾（如果使用完整 URL）
if (API_BASE_URL.startsWith('http') && !API_BASE_URL.endsWith('/api')) {
    // 如果環境變數設置錯誤（例如設置為 http://192.168.25.152:8080），自動添加 /api
    API_BASE_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL + 'api' : API_BASE_URL + '/api'
}

// 導出 API_BASE_URL 供其他檔案使用
export { API_BASE_URL }

/**
 * 通用 API 請求函數（使用 Authorization header 認證，不使用 Cookie）
 */
export async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
    }

    // 從 localStorage 讀取 token 和 userId（與 user 主頁同步）
    let token = localStorage.getItem('token')
    let userId = null

    // 嘗試從 Pinia 持久化數據讀取（key: "hoUser"，存在 sessionStorage 中）
    try {
        // 先從 sessionStorage 讀取（user store 使用 sessionStorage）
        let hoUserData = sessionStorage.getItem('hoUser')
        // 如果 sessionStorage 沒有，再從 localStorage 讀取（兼容舊數據）
        if (!hoUserData) {
            hoUserData = localStorage.getItem('hoUser')
        }

        if (hoUserData) {
            const parsed = JSON.parse(hoUserData)
            // 讀取 token
            if (parsed?.token && !token) {
                token = parsed.token
                // 同時同步到 localStorage，方便後續讀取
                localStorage.setItem('token', token)
            }
            // 讀取 userId
            if (parsed?.userId) {
                userId = parsed.userId
            }
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('從 Pinia 持久化數據讀取失敗:', error)
        }
    }
    // ⭐ 新增：嘗試從前台使用者 Pinia（key: "pinia-user"）讀取
    try {
        if (!userId || !token) {
            let piniaUserData =
                sessionStorage.getItem('pinia-user') ||
                localStorage.getItem('pinia-user')

            if (piniaUserData) {
                const parsedPinia = JSON.parse(piniaUserData)
                const state = parsedPinia.state || parsedPinia  // pinia persist 格式

                // token
                if (state.token && !token) {
                    token = state.token
                    localStorage.setItem('token', token)
                }

                // userId（多種命名都支援）
                if (state.userId) {
                    userId = state.userId
                } else if (state.id) {
                    userId = state.id
                } else if (state.user && state.user.id) {
                    userId = state.user.id
                }
            }
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('從 pinia-user 讀取失敗:', error)
        }
    }

    // 如果還是沒有 userId，嘗試從 localStorage 直接讀取
    if (!userId) {
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) {
            userId = parseInt(storedUserId)
        }
    }

    // 調試信息（僅在開發模式，且只在首次請求或 token 變化時輸出）
    if (import.meta.env.DEV) {
        // 只在首次請求或 token 變化時輸出，避免日誌過於頻繁
        const lastToken = window._lastApiToken
        if (!lastToken || lastToken !== token) {
            console.log('API 請求 - Token:', token ? (token.substring(0, 20) + '...') : '不存在')
            window._lastApiToken = token
        }
        // URL 信息只在錯誤時輸出，正常請求不輸出
    }

    // 如果 token 存在，添加到 Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    } else {
        // 調試：如果沒有 token，記錄警告
        if (import.meta.env.DEV) {
            console.warn('API 請求缺少 token，可能導致 401 錯誤')
            console.warn('localStorage token:', localStorage.getItem('token'))
            console.warn('localStorage hoUser:', localStorage.getItem('hoUser'))
        }
    }

    // 如果 userId 存在，添加到 userId header（後端直接從 header 讀取）
    if (userId) {
        headers['userId'] = String(userId)
        // 調試：確認 userId 已設置
        if (import.meta.env.DEV) {
            console.log('API 請求 - userId header:', userId)
        }
    } else {
        // 調試：如果沒有 userId，記錄警告
        if (import.meta.env.DEV) {
            console.warn('API 請求缺少 userId，後端可能無法識別用戶')
            console.warn('sessionStorage hoUser:', sessionStorage.getItem('hoUser'))
            console.warn('localStorage hoUser:', localStorage.getItem('hoUser'))
            console.warn('localStorage userId:', localStorage.getItem('userId'))
        }
    }

    const defaultOptions = {
        headers,
        // 不使用 Cookie，不設置 credentials
    }

    // 只使用 Authorization header 認證，不使用 Cookie

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    }

    try {
        const fullUrl = `${API_BASE_URL}${url}`
        // 調試：確認完整 URL
        if (import.meta.env.DEV) {
            console.log('API 請求 - 完整 URL:', fullUrl)
        }
        const response = await fetch(fullUrl, config)

        // 如果 token 無效（401），靜默處理，不拋出錯誤
        // token 檢查只在進入飯店管理頁面時進行
        if (response.status === 401) {
            // 返回一個空對象，不拋出錯誤，讓調用方可以正常處理
            // 這樣不會打斷用戶的操作
            return {}
        }

        if (!response.ok) {
            let errorData
            try {
                const text = await response.text()
                if (text) {
                    errorData = JSON.parse(text)
                } else {
                    errorData = {
                        message: response.statusText,
                        error: response.statusText
                    }
                }
            } catch (parseError) {
                // 如果無法解析 JSON，使用狀態文本
                errorData = {
                    message: response.statusText,
                    error: response.statusText
                }
            }

            // 修改：處理驗證錯誤（包含 errors 欄位的情況）
            let errorMessage = errorData.error || errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`

            // 如果有 errors 欄位（驗證錯誤），組合所有錯誤訊息
            if (errorData.errors && typeof errorData.errors === 'object') {
                const errorMessages = Object.entries(errorData.errors)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join('; ')
                if (errorMessages) {
                    errorMessage = `驗證失敗: ${errorMessages}`
                }
            }
            // 如果有 fieldErrors 欄位（另一種驗證錯誤格式）
            else if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
                const errorMessages = Object.entries(errorData.fieldErrors)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join('; ')
                if (errorMessages) {
                    errorMessage = `驗證失敗: ${errorMessages}`
                }
            }

            // 記錄詳細錯誤信息以便調試（只在開發模式）
            // 404 錯誤在某些情況下是預期的（如資源不存在），使用 warn 而不是 error
            if (import.meta.env.DEV) {
                const logMethod = response.status === 404 ? console.warn : console.error
                logMethod('API 請求失敗：', {
                    url: `${API_BASE_URL}${url}`,
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData,
                    errorMessage: errorMessage
                })
            }

            // 創建錯誤對象，包含狀態碼信息，方便調用方檢查
            const error = new Error(errorMessage)
            error.status = response.status
            error.statusText = response.statusText
            error.errorData = errorData
            error.errorMessage = errorMessage
            throw error
        }

        return await response.json()
    } catch (error) {
        throw error
    }
}

/**
 * 上傳文件專用函數（支持 FormData）
 * @param {string} url - API 路徑（例如：'/upload/image'）
 * @param {FormData} formData - FormData 對象
 * @param {Object} options - 額外的選項
 * @returns {Promise} 上傳結果
 */
export async function apiUpload(url, formData, options = {}) {
    // 從 localStorage 讀取 token 和 userId
    let token = localStorage.getItem('token')
    let userId = null

    // 嘗試從 Pinia 持久化數據讀取
    try {
        let hoUserData = sessionStorage.getItem('hoUser')
        if (!hoUserData) {
            hoUserData = localStorage.getItem('hoUser')
        }

        if (hoUserData) {
            const parsed = JSON.parse(hoUserData)
            if (parsed?.token && !token) {
                token = parsed.token
                localStorage.setItem('token', token)
            }
            if (parsed?.userId) {
                userId = parsed.userId
            }
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('從 Pinia 持久化數據讀取失敗:', error)
        }
    }

    // 如果還是沒有 userId，嘗試從 localStorage 直接讀取
    if (!userId) {
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) {
            userId = parseInt(storedUserId)
        }
    }

    const headers = {}

    // 添加 Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    // 添加 userId header
    if (userId) {
        headers['userId'] = String(userId)
    }

    // 合併自定義 headers（注意：不要設置 Content-Type，讓瀏覽器自動設置，這樣才能正確處理 FormData）
    const config = {
        method: 'POST',
        headers: {
            ...headers,
            ...options.headers,
        },
        body: formData,
        ...options,
    }

    // 移除 Content-Type（讓瀏覽器自動設置，包含 boundary）
    if (config.headers['Content-Type']) {
        delete config.headers['Content-Type']
    }

    try {
        const fullUrl = `${API_BASE_URL}${url}`
        if (import.meta.env.DEV) {
            console.log('API 上傳 - 完整 URL:', fullUrl)
        }
        const response = await fetch(fullUrl, config)

        if (response.status === 401) {
            return {}
        }

        if (!response.ok) {
            let errorData
            try {
                const text = await response.text()
                if (text) {
                    errorData = JSON.parse(text)
                } else {
                    errorData = {
                        message: response.statusText,
                        error: response.statusText
                    }
                }
            } catch (parseError) {
                errorData = {
                    message: response.statusText,
                    error: response.statusText
                }
            }

            const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`

            if (import.meta.env.DEV) {
                console.error('API 上傳失敗：', {
                    url: fullUrl,
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData,
                    errorMessage: errorMessage
                })
            }

            throw new Error(errorMessage)
        }

        return await response.json()
    } catch (error) {
        throw error
    }
}

