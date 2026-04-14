/**
 * 打开桌面便签窗口
 * @param {object} params
 * @param {string} [params.filter] - 筛选类型: all, today, planned, starred, completed
 * @param {string} [params.categoryId] - 分类ID（与 filter 二选一）
 */
export function openStickyNote({ filter = 'all', categoryId = null } = {}) {
  if (window.todoServices?.openStickyNote) {
    window.todoServices.openStickyNote({ filter, categoryId })
  } else {
    window.utools?.showNotification?.('当前版本不支持便签功能')
  }
}
