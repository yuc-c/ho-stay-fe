/**
 * 付款方式定義
 * 這些值應該與 Booking 表的 payment_type 欄位可能的值保持一致
 */

/**
 * 系統支援的付款方式列表
 * 這些值會存儲在 Booking 表的 payment_type 欄位中
 */
export const PAYMENT_TYPES = {
  ONLINE: 'online',           // 線上付款（透過平台支付服務）
  CREDIT_CARD: 'credit_card', // 信用卡
  CASH: 'cash',               // 現金
  BANK_TRANSFER: 'bank_transfer', // 銀行轉帳
  ATM: 'atm',                 // ATM 轉帳
  ON_SITE: 'on_site',         // 到店付款
}

/**
 * 付款方式顯示標籤
 */
export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPES.ONLINE]: '線上付款',
  [PAYMENT_TYPES.CREDIT_CARD]: '信用卡',
  [PAYMENT_TYPES.CASH]: '現金',
  [PAYMENT_TYPES.BANK_TRANSFER]: '銀行轉帳',
  [PAYMENT_TYPES.ATM]: 'ATM 轉帳',
  [PAYMENT_TYPES.ON_SITE]: '到店付款',
}

/**
 * 獲取付款方式標籤
 * @param {string} paymentType - 付款方式代碼
 * @returns {string} 付款方式標籤
 */
export function getPaymentTypeLabel(paymentType) {
  return PAYMENT_TYPE_LABELS[paymentType] || paymentType || '未知'
}

/**
 * 獲取所有付款方式選項（用於下拉選單等）
 * @returns {Array} 付款方式選項列表
 */
export function getPaymentTypeOptions() {
  return Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label
  }))
}

/**
 * 預設付款方式（平台統一使用線上付款）
 */
export const DEFAULT_PAYMENT_TYPE = PAYMENT_TYPES.ONLINE

