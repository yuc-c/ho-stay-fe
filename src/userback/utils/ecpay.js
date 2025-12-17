// src/utils/ecpay.js

/**
 * 綠界金流工具函式
 */

/**
 * 提交付款表單到綠界
 * @param {string} apiUrl - 綠界 API URL
 * @param {object} formData - 表單資料
 */
export function submitECPayForm(apiUrl, formData) {
    // 建立隱藏的表單
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = apiUrl;
    form.style.display = 'none';

    // 將所有參數加入表單
    Object.keys(formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
    });

    // 加入 CheckMacValue
    if (formData.CheckMacValue) {
        const checkMacInput = document.createElement('input');
        checkMacInput.type = 'hidden';
        checkMacInput.name = 'CheckMacValue';
        checkMacInput.value = formData.CheckMacValue;
        form.appendChild(checkMacInput);
    }

    // 加入到 body 並提交
    document.body.appendChild(form);
    form.submit();
}

/**
 * 格式化金額 (加上千分位)
 * @param {number} amount - 金額
 * @returns {string} 格式化後的金額
 */
export function formatAmount(amount) {
    return amount.toLocaleString('zh-TW');
}